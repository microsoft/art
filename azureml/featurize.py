import pickle
import sys
import os

import pickle
import numpy as np
import pandas as pd
from PIL import Image, ImageFile
from urllib.request import urlopen
import math
import glob
import random
import argparse

batch_size = 256
img_width = 225
img_height = 225
model = "resnet"

os.environ["CUDA_VISIBLE_DEVICES"] = str(2)

parser = argparse.ArgumentParser()
parser.add_argument("--data-dir", type=str, dest="data_folder")
data_folder = parser.parse_args().data_folder

files = glob.glob(os.path.join(data_folder, "resized_images/AK-BR*.jpg"))
print("Found {} images...".format(len(files)))

output_root = './outputs'  # root folder filepath. All data from this notebookwill be saved to this directory
features_fn = os.path.join(output_root,'features_{}.pkl'.format(model))  # name of the np array of size (sample_length, img_length) will be saved. These are the featurized versions of the images
files_fn = os.path.join(output_root, 'metadata_{}.pkl'.format(model))  # helper table that tracks the name & URL for each row

# initialize model
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

def batch(iterable, n):
    current_batch = []
    for item in iterable:
        if item is not None:
            current_batch.append(item)
            if len(current_batch) == n:
                yield current_batch
                current_batch = []
    if current_batch:
        yield current_batch


batches = list(batch(files, batch_size))
metadata = []

def prep_image_inner(filename):
    with open(filename, "rb") as file:
        img = Image.open(file)

        # non RGB images won't have the right number of channels
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # re-size, expand dims and run through the ResNet50 model
        img = np.array(img.resize((img_width, img_height)))
    img = preprocess_input(img.astype(np.float))
    #letter = filename.split("/")[-2]
    #font = filename.split("/")[-1].split(".")[0]
    #metadata.append((letter, font))

    #fn = filename.split("/")[-1].split(".")[0]
    #content = "_".join(fn.split("_")[0:3])
    #style = "_".join(fn.split("_")[3:])
    #metadata.append((content, style))

    metadata.append(filename.split("/")[-1])
    return img


def load_images(filenames):
    batch = []
    for url in filenames:
        try:
            batch.append(prep_image_inner(url))
        except Exception as e:
            print(e)
            try:
                batch.append(prep_image_inner(url))
            except Exception as e:
                print("Failing a second time", e)
    return np.array(batch)


data_iterator = (load_images(batch) for batch in batches)
predictions = keras_model.predict_generator(data_iterator, steps = len(batches), verbose=1)

import os
if not os.path.exists(output_root): os.makedirs(output_root)
pickle.dump(predictions, open(features_fn, 'wb'))
pickle.dump(metadata, open(files_fn, 'wb'))

print(predictions.shape)
print(predictions.shape[0], len(metadata))
assert(predictions.shape[0] == len(metadata))
