import pickle
import sys
import os

import pickle
import numpy as np
import pandas as pd
from PIL import Image, ImageFile
import requests
import math
import glob
import random
import argparse
import csv
from tqdm import tqdm

# Initialize
batch_size = 256
img_width = 225
img_height = 225
model = "resnet"

os.environ["CUDA_VISIBLE_DEVICES"] = str(2)

parser = argparse.ArgumentParser()
parser.add_argument("--data-dir", type=str, dest="data_folder")
data_folder = parser.parse_args().data_folder

csv_path =  "metadata_smol.csv"
print("Found csv...")

output_root = './outputs'  # root folder filepath. All data from this notebookwill be saved to this directory
features_culture_fn = os.path.join(output_root,'features_culture_{}.pkl'.format(model))  # name of the np array of size (sample_length, img_length) will be saved. These are the featurized versions of the images
features_medium_fn = os.path.join(output_root,'features_medium_{}.pkl'.format(model))  # name of the np array of size (sample_length, img_length) will be saved. These are the featurized versions of the images
files_fn = os.path.join(output_root, 'metadata_{}.pkl'.format(model))  # helper table that tracks the name & URL for each row

if model == "resnet":
    from keras.applications.resnet50 import preprocess_input
    from keras.applications.resnet50 import ResNet50
    keras_model = ResNet50(
        input_shape=[img_width, img_height, 3],
        weights='imagenet',
        include_top=False,
        pooling='avg'
    )
elif model == "densenet":
    from keras.applications.densenet import preprocess_input
    from keras.applications.densenet import DenseNet121
    keras_model = DenseNet121(
        input_shape=[img_width, img_height, 3],
        weights='imagenet',
        include_top=False,
        pooling='avg'
    )

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

def download_image(url, id):
    img = Image.open(requests.get(url, stream=True).raw)

    # non RGB images won't have the right number of channels
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # re-size, expand dims and run through the ResNet50 model
    img = np.array(img.resize((img_width, img_height)))
    img = preprocess_input(img.astype(np.float))

    metadata.append(id)
    return img

def load_images(images):
    batch = []
    for id, url in images:
        try:
            batch.append(download_image(url, id))
        except Exception as e:
            print(e)
            try:
                batch.append(download_image(url, id))
            except Exception as e:
                print("Failing a second time", e)
    return np.array(batch)

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
                images.append((row[column_numbers["id"]], row[column_numbers["Thumbnail_Url"]]))
    return images

images = read_metadata_csv(csv_path)

batches = list(batch(images, batch_size))
metadata = []
data_iterator = (load_images(batch) for batch in tqdm(batches))
predictions = keras_model.predict_generator(data_iterator, steps = len(batches), verbose=1)

# Load into ball tree
from pyspark.sql import SQLContext, SparkSession
from pyspark import SparkContext, SQLContext
spark = SparkSession.builder \
    .master("local[*]") \
    .appName("TestConditionalBallTree") \
    .config("spark.jars.packages", "com.microsoft.ml.spark:mmlspark_2.11:1.0.0-rc1-37-45c19d0a-SNAPSHOT") \
    .config("spark.jars.repositories", "https://mmlspark.azureedge.net/maven") \
    .config("spark.executor.heartbeatInterval", "60s") \
    .getOrCreate()

from mmlspark.nn.ConditionalBallTree import ConditionalBallTree

cbt = ConditionalBallTree([[1.0, 2.0], [2.0, 3.0]], [1, 2], ['foo', 'bar'], 50)
result = cbt.findMaximumInnerProducts([1.0, 2.0], {'foo'}, 5)
expected = [(0, 5.0)]
print(result, result == expected)

if not os.path.exists(output_root): os.makedirs(output_root)
