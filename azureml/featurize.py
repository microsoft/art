import argparse
import os
import pickle
import urllib.request
from azureml.core import Run, Workspace
from multiprocessing import Pool
import numpy as np
import pandas as pd
import tensorflow as tf
from PIL import Image
from keras.applications.resnet50 import ResNet50
from keras.applications.resnet50 import preprocess_input
from pyspark.sql import SparkSession
from pyspark import SparkContext, SQLContext


# Initialize
batch_size = 512
img_width = 225
img_height = 225
model = "resnet"
os.environ["CUDA_VISIBLE_DEVICES"] = str(0)

# gets mount location from aml_feat.py, passed in as args
parser = argparse.ArgumentParser()
parser.add_argument("--data-dir", type=str, dest="data_folder")
data_folder = parser.parse_args().data_folder
tsv_path = os.path.join(data_folder, "met_rijks_metadata.tsv")

# create file paths for saving balltree later
output_root = './outputs'
features_culture_fn = os.path.join(output_root, 'features_culture.ball')
features_classification_fn = os.path.join(output_root, 'features_classification.ball')
metadata_fn = os.path.join(output_root, 'metadata.pkl')

#cached_features_url = "https://mmlsparkdemo.blob.core.windows.net/mosaic/features_and_successes.pkl"
#cached_features_fn = 'features_and_successes.pkl'
cached_features_url = "https://mmlsparkdemo.blob.core.windows.net/mosaic/met_and_rijks_art_with_features.parquet.zip"
cached_features_fn = "met_and_rijks_art_with_features.parquet.zip"
parquet_fn = "met_and_rijks_art_with_features.parquet"

write_to_index = False

# downloading java dependencies
print(os.environ.get("JAVA_HOME", "WARN: No Java home found"))
spark = SparkSession.builder \
    .master("local[*]") \
    .appName("TestConditionalBallTree") \
    .config("spark.jars.packages", "com.microsoft.ml.spark:mmlspark_2.11:1.0.0-rc1-38-a6970b95-SNAPSHOT") \
    .config("spark.jars.repositories", "https://mmlspark.azureedge.net/maven") \
    .config("spark.executor.heartbeatInterval", "60s") \
    .config("spark.driver.memory", "32g") \
    .config("spark.driver.maxResultSize", "8g") \
    .getOrCreate()

from mmlspark.nn.ConditionalBallTree import ConditionalBallTree


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


def parallel_apply(df, func, n_cores=16):
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
    url = str(metadata_row["Thumbnail_Url"])
    museum = str(metadata_row["Museum"])
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

if not os.path.exists(tsv_path):
    urllib.request.urlretrieve("https://mmlsparkdemo.blob.core.windows.net/mosaic/met_rijks_metadata.tsv",
                               tsv_path)

metadata = pd.read_csv(tsv_path, delimiter="\t", keep_default_na=False)
metadata.fillna('')  # replace nan values with empty string

if write_to_index:
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
    import base64


    def url_encode_id(idval):
        return base64.b64encode(bytes(idval, "UTF-8")).decode("utf-8")


    describeImage = (AnalyzeImage()
                     .setSubscriptionKey(image_subscription_key)
                     .setLocation("eastus")
                     .setImageUrlCol("Thumbnail_Url")
                     .setOutputCol("RawImageDescription")
                     .setErrorCol("Errors")
                     .setVisualFeatures(["Categories", "Tags", "Description", "Faces", "ImageType", "Color", "Adult"])
                     .setConcurrency(5))

    df = spark.createDataFrame(metadata)
    df2 = describeImage.transform(df) \
        .select("*", "RawImageDescription.*").drop("Errors", "RawImageDescription").cache()
    df2.coalesce(3).writeToAzureSearch(
        subscriptionKey=subscription_key,
        actionCol="searchAction",
        serviceName="extern-search",
        indexName="merged-art-search-6",
        keyCol="id",
        batchSize="1000"
    )


if cached_features_url is not None:
    if not os.path.exists(cached_features_fn):
        urllib.request.urlretrieve(cached_features_url, cached_features_fn)
    if not os.path.exists(parquet_fn):
        print("extracting")
        from zipfile import ZipFile
        with ZipFile(cached_features_fn, 'r') as zipObj:
            zipObj.extractall()
        print("done extracting")

    #with open(cached_features_fn, "rb") as f:
    #    [features, successes] = pickle.load(f)
    #print("Loaded cached features")
else:
    # create directory for downloading images, then download images simultaneously
    print("Downloading images...")
    os.makedirs("images", exist_ok=True)
    metadata = parallel_apply(metadata, download_image_df)
    metadata = metadata[metadata["Success"].fillna(False)]  # filters out unsuccessful rows
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

    assert_gpu()  # raises exception if gpu is not available
    features = keras_model.predict_generator(data_iterator, steps=len(batches), verbose=1)
    features /= np.linalg.norm(features, axis=1).reshape(len(successes), 1)

    with open(cached_features_fn, "wb+") as f:
        pickle.dump([features, successes], f)

# print(features.shape)
#
# from py4j.java_collections import ListConverter
#
# # convert to list and then create the two balltrees for culture and classification(medium)
# ids = [row["id"] for row in successes]
# features = features.tolist()
# print("fitting culture ball tree")
#
# converter = ListConverter()
# gc = SparkContext._active_spark_context._jvm._gateway_client
# from pyspark.ml.linalg import Vectors, VectorUDT
#
# java_features = converter.convert(features,gc)
# java_cultures = converter.convert([row["Culture"] for row in successes], gc)
# java_classifications = converter.convert([row["Classification"] for row in successes], gc)
# java_values = converter.convert(ids, gc)
#
# cbt_culture = ConditionalBallTree(java_features, java_values, java_cultures, 50)
# print("fitting class ball tree")
#
# cbt_classification = ConditionalBallTree(java_features, java_values, java_classifications, 50)
# print("fit culture ball tree")
#
# # save the balltrees to output directory and pickle the museum and id metadata
# os.makedirs(output_root, exist_ok=True)
# cbt_culture.save(features_culture_fn)
# cbt_classification.save(features_classification_fn)
# pickle.dump(successes, open(metadata_fn, 'wb+'))

from mmlspark.nn import *

df = spark.read.parquet(parquet_fn)

cols_to_group = df.columns
cols_to_group.remove("Norm_Features")

from pyspark.sql.functions import struct
df2 = df.withColumn("Meta", struct(*cols_to_group))

cknn_classification = (ConditionalKNN()
  .setOutputCol("Matches")
  .setFeaturesCol("Norm_Features")
  .setValuesCol("Meta")
  .setLabelCol("Classification")
  .fit(df2))
cbt_classification = ConditionalBallTree(None, None, None, None, cknn_classification._java_obj.getBallTree())

cknn_culture = (ConditionalKNN()
  .setOutputCol("Matches")
  .setFeaturesCol("Norm_Features")
  .setValuesCol("Meta")
  .setLabelCol("Culture")
  .fit(df2))
cbt_culture = ConditionalBallTree(None, None, None, None, cknn_culture._java_obj.getBallTree())

os.makedirs(output_root, exist_ok=True)
cbt_culture.save(features_culture_fn)
cbt_classification.save(features_classification_fn)

