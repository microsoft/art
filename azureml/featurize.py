import argparse
import multiprocessing
import os
import pickle
import urllib.request
from azureml.core import Run, Workspace

import numpy as np
import pandas as pd
import tensorflow as tf
from PIL import Image
from keras.applications.resnet50 import ResNet50
from keras.applications.resnet50 import preprocess_input
from pyspark.sql.functions import lit, udf, col, split
from mmlspark.cognitive import *

# Load into ball tree
from pyspark.sql import SparkSession
from tqdm import tqdm
from multiprocessing import Pool

# downloading java dependencies
print(os.environ.get("JAVA_HOME", "WARN: No Java home found"))

spark = SparkSession.builder \
    .master("local[*]") \
    .appName("TestConditionalBallTree") \
    .config("spark.jars.packages", "com.microsoft.ml.spark:mmlspark_2.11:1.0.0-rc1-38-a6970b95-SNAPSHOT") \
    .config("spark.jars.repositories", "https://mmlspark.azureedge.net/maven") \
    .config("spark.executor.heartbeatInterval", "60s") \
    .getOrCreate()

from mmlspark.nn.ConditionalBallTree import ConditionalBallTree

# Initialize
batch_size = 256
img_width = 225
img_height = 225
model = "resnet"

os.environ["CUDA_VISIBLE_DEVICES"] = str(0)

# gets mount location from aml_feat.py, passed in as args
parser = argparse.ArgumentParser()
parser.add_argument("--data-dir", type=str, dest="data_folder")
data_folder = parser.parse_args().data_folder

csv_path = "metadata_smol.csv"

# create file paths for saving balltree later
output_root = './outputs'
features_culture_fn = os.path.join(output_root, 'features_culture.ball')
features_classification_fn = os.path.join(output_root, 'features_classification.ball')
metadata_fn = os.path.join(output_root, 'metadata.pkl')

# Featurize
def batch(iterable, n):
    """
    Splits iterable into nested array with inner size n
    """
    current_batch = []
    for item in iterable:
        if item is not None:
            current_batch.append(item)
            if len(current_batch) == n:
                yield current_batch
                current_batch = []
    if current_batch:
        yield current_batch


def parallel_apply(df, func, n_cores=4):
    df_split = np.array_split(df, n_cores)
    pool = Pool(n_cores)
    df = pd.concat(pool.map(func, df_split))
    pool.close()
    pool.join()
    return df


def retry(func, args, times):
    if times == 0:
        return False
    else:
        try:
            func(args)
            return True
        except Exception as e:
            print(e)
            retry(func, args, times - 1)


def download_image_inner(metadata_row):
    """
    Download an image from the given url and save it to disk as filename {museum}_{id}{extension}
    where the extension is inferred from content type. Returns None if download fails twice.
    """
    url = metadata_row["Thumbnail_Url"]
    museum = metadata_row["Museum"]
    local_file = "images/" + museum + "_" + url.split("/")[-1]
    if not os.path.exists(local_file):
        urllib.request.urlretrieve(url, local_file)


def download_image(metadata_row):
    return retry(download_image_inner, metadata_row, 3)


def download_image_df(df):
    df["Success"] = df.apply(download_image, axis=1)
    return df


def load_images(rows, successes):
    """Given an array of images, return a numpy array of PIL image data
    after reading the image's filename from disk.

    If successful, append the image dict (with metadata) to the
    provided metadata list, respectively.
    
    Arguments:
        images {dict[]} -- array of dictionaries that represent images of artwork
        metadata {dict[]} -- array of image objects to append to if reading is successful
    
    Returns:
        Image[] -- an array of Pillow images
    """
    batch = []
    for i, row in rows:
        filename = "images/" + row["Museum"] + "_" + row["Thumbnail_Url"].split("/")[-1]
        try:
            batch.append(load_image(filename))
            successes.append(row)
        except Exception as e:
            print(e)
            print("Failed to load image: " + filename)
    return np.array(batch)


def load_image(filename):
    """
    Given a filename of a musueum image, make sure that it is an RGB image and resize and preprocess the image.
    
    Arguments:
        filename {str} -- filename of the image to preprocess
    
    Returns:
        img {Image}-- an Image object that has been turned into an RGB image, resized, and preprocessed
    """
    img = Image.open(filename)
    # non RGB images won't have the right number of channels
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # re-size, expand dims and run through the ResNet50 model
    img = np.array(img.resize((img_width, img_height)))
    img = preprocess_input(img.astype(np.float))

    return img


def assert_gpu():
    """
    This function will raise an exception if a GPU is not available to tensorflow.
    """
    device_name = tf.test.gpu_device_name()
    if device_name != '/device:GPU:0':
        raise SystemError('GPU device not found')
    print('Found GPU at: {}'.format(device_name))


metadata = pd.read_csv(csv_path)

ws = Workspace(
    subscription_id="ce1dee05-8cf6-4ad6-990a-9c80868800ba",
    resource_group="extern2020",
    workspace_name="exten-amls"
)

keyvault = ws.get_default_keyvault()
run = Run.get_context()
subscription_key = keyvault.get_secret(name="subscriptionKey")
image_subscription_key = keyvault.get_secret(name="imageSubscriptionKey")

from mmlspark.cognitive import AnalyzeImage
from mmlspark.stages import SelectColumns

df =  spark.read.option("header",True).format("csv").load(csv_path).withColumn("searchAction", lit("upload"))

describeImage = (AnalyzeImage()
                 .setSubscriptionKey(image_subscription_key)
                 .setLocation("eastus")
                 .setImageUrlCol("Thumbnail_Url")
                 .setOutputCol("RawImageDescription")
                 .setErrorCol("Errors")
                 .setVisualFeatures(["Categories", "Tags", "Description", "Faces", "ImageType", "Color", "Adult"])
                 .setConcurrency(5))

df2 = describeImage.transform(df)\
    .select("*", "RawImageDescription.*").drop("Errors", "RawImageDescription").cache()

df2.coalesce(3).writeToAzureSearch(
  subscriptionKey=subscription_key,
  actionCol="searchAction",
  serviceName="extern-search",
  indexName="merged-art-search-5",
  keyCol="id",
  batchSize="1000"
  )


# create directory for downloading images, then download images simultaneously
print("Downloading images...")
os.makedirs("images", exist_ok=True)

metadata = parallel_apply(metadata, download_image_df)
metadata = metadata[metadata["Success"]] # filters out unsuccessful rows

batches = list(batch(metadata.iterrows(), batch_size))

successes = []  # clear metadata, images are only here if they are loaded from disk
data_iterator = (load_images(batch, successes) for batch in batches)

# featurize the images then normalize them
keras_model = ResNet50(
    input_shape=[img_width, img_height, 3],
    weights='imagenet',
    include_top=False,
    pooling='avg'
)

# assert_gpu() # raises exception if gpu is not available

features = keras_model.predict_generator(data_iterator, steps=len(batches), verbose=1)
features /= np.linalg.norm(features, axis=1).reshape(len(metadata), 1)

# convert to list and then create the two balltrees for culture and classification(medium)
ids = [row["id"] for row in successes]
features = features.tolist()
cbt_culture = ConditionalBallTree(features, ids, [row["Culture"] for row in successes], 50)
cbt_classification = ConditionalBallTree(features, ids, [row["Classification"] for row in successes], 50)

# save the balltrees to output directory and pickle the museum and id metadata
os.makedirs(output_root, exist_ok=True)
cbt_culture.save(features_culture_fn)
cbt_classification.save(features_classification_fn)
pickle.dump(successes, open(metadata_fn, 'wb'))

cbt_culture_2 = ConditionalBallTree.load(features_culture_fn)
print(cbt_culture_2)
