import argparse
import csv
import glob
import math
import multiprocessing
import os
import pickle
import random
import sys

import certifi
import numpy as np
import pandas as pd
import requests
from pyspark import SparkContext, SQLContext
# Load into ball tree
from pyspark.sql import SparkSession, SQLContext

from ConditionalBallTree import ConditionalBallTree
from PIL import Image, ImageFile
from tqdm import tqdm

import tensorflow as tf

from keras.applications.resnet50 import preprocess_input
from keras.applications.resnet50 import ResNet50

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

csv_path =  "metadata_smol.csv"

# create file paths for saving balltree later
output_root = './outputs'
features_culture_fn = os.path.join(output_root,'features_culture.ball')
features_classification_fn = os.path.join(output_root,'features_classification.ball') 
metadata_fn = os.path.join(output_root, 'metadata.pkl') 

# Featurize
def read_metadata_csv(csv_path):
    """
    Given a path to a csv file containing metadata for musueum images,
    read the csv and return an array of tuples with the id and thumbnail url
    of the image.

    Assumes that the CSV passed in contains column names on row 1, and contains 
    columns with name "id" and "Thumbnail_Url"
    
    Arguments:
        csv_path {str} -- a path to a csv containing at least two columns with name
        "id" and "Thumbnail_Url"
    
    Returns:
        tuple[] -- an array of tuples containing the id and thumbnail url of each row
    """
    line_count = 0
    images = []
    column_numbers = {}
    with open(csv_path) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for i, row in enumerate(csv_reader):
            # create dict that maps column names to column number
            if i == 0:
                for j, column_name in enumerate(row):
                    column_numbers[column_name] = j
            else:
                images.append(
                    {
                        "id": row[column_numbers["id"]],
                        "museum": row[column_numbers["Museum"]],
                        "url": row[column_numbers["Thumbnail_Url"]],
                        "full_size": row[column_numbers["Image_Url"]],
                        "culture": row[column_numbers["Culture"]],
                        "classification": row[column_numbers["Classification"]],
                        "museum_url": row[column_numbers["Museum_Page"]],
                        "artist": row[column_numbers["Artist"]],
                        "title": row[column_numbers["Title"]]
                    }
                )
    return images

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

def download_image(image):
    """
    Download an image from the given url and save it to disk as filename {museum}_{id}{extension}
    where the extension is inferred from content type. Returns None if download fails twice.
    """
    for _ in range(2):
        r = requests.get(image["url"], verify=certifi.where())
        if r.status_code == 200:
            extension = ""
            if r.headers["Content-Type"] == "image/jpeg":
                extension = ".jpg"
            elif r.headers["Content-Type"] == "image/png":
                extension = ".png"
            filename = os.path.join(
                "images/", 
                "{}_{}{}".format(
                    image["museum"],
                    image["id"],
                    extension
            ))
            with open(filename, 'wb') as f:
                f.write(r.content)
            image["filename"] = filename # append filename to image object
            return image
    return None

def load_images(images, metadata):
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
    for image in images:
        if image.get("filename", None) is None:
            print("Error: no filename")
            continue # skip if no filename
        filename = image["filename"]
        try:
            batch.append(load_image(filename))
            metadata.append(image)
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

metadata = read_metadata_csv(csv_path)

# create directory for downloading images, then dowload images simultaneously
print("Downloading images...")
if not os.path.exists("images"): os.makedirs("images")
pool = multiprocessing.Pool(processes=10)
downloaded_images = list(tqdm(pool.imap(download_image, metadata), total=len(metadata), desc="Downloading"))

# makes list of only the downlaods that succeded
metadata = [image for image in downloaded_images if image is not None]

batches = list(batch(metadata, batch_size))
print("Loading images...")
metadata = [] # clear metadata, images are only here if they are loaded from disk
data_iterator = (load_images(batch, metadata) for batch in tqdm(batches, desc="Loading"))

# featurize the images then normalize them
keras_model = ResNet50(
    input_shape=[img_width, img_height, 3],
    weights='imagenet',
    include_top=False,
    pooling='avg'
)

assert_gpu() # raises exception if gpu is not available

features = keras_model.predict_generator(data_iterator, steps = len(batches), verbose=1)
features /= np.linalg.norm(features, axis=1).reshape(len(metadata), 1)

# downloading java dependencies
spark = SparkSession.builder \
    .master("local[*]") \
    .appName("TestConditionalBallTree") \
    .config("spark.jars.packages", "com.microsoft.ml.spark:mmlspark_2.11:1.0.0-rc1-41-ccc4ceef-SNAPSHOT") \
    .config("spark.jars.repositories", "https://mmlspark.azureedge.net/maven") \
    .config("spark.executor.heartbeatInterval", "60s") \
    .getOrCreate()

# convert to list and then create the two balltrees for culture and classification(medium)
ids =  [img["id"] for img in metadata]
features = features.tolist()
cbt_culture = ConditionalBallTree(features, ids, [img["culture"] for img in metadata], 50)
cbt_classification = ConditionalBallTree(features, ids,  [img["classification"] for img in metadata], 50)

# save the balltrees to output directory and pickle the museum and id metadata
if not os.path.exists(output_root): os.makedirs(output_root)
cbt_culture.save(features_culture_fn)
cbt_classification.save(features_classification_fn)
pickle.dump(metadata, open(metadata_fn, 'wb'))