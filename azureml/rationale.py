import os
from io import BytesIO
import json
import os
import traceback
from io import BytesIO

import numpy as np
import requests
import tensorflow as tf
from PIL import Image
from azureml.contrib.services.aml_request import rawhttp
from azureml.contrib.services.aml_response import AMLResponse
from azureml.core.model import Model
from keras.applications.resnet50 import ResNet50, preprocess_input
from pyspark.sql import SparkSession

import keras
from keras.preprocessing import image
from skimage.io import imread
import matplotlib.pyplot as plt
import shap
import sys
from io import BytesIO
from zipfile import ZipFile
from urllib.request import urlopen
import random
from keras.layers import Input, Lambda
from keras import Model
import keras.backend as K
from scipy.ndimage.filters import gaussian_filter

def prep_image(url, preprocess=False):
  response = requests.get(url)
  img = Image.open(BytesIO(response.content))
  if img.mode != 'RGB':
      img = img.convert('RGB')
  x = np.array(img.resize((224, 224)))
  x = np.expand_dims(x, axis=0)
  if preprocess:  
    return preprocess_input(x), img.size
  return x, img.size

def setup_model():
  keras_model = ResNet50(input_shape=[224, 224, 3], weights='imagenet', include_top=False, pooling='avg')
  im1 = Input([224, 224, 3])
  f1 = keras_model(im1)
  return keras_model, im1, f1

def inv_logit(y):
    return tf.math.log(y/(1-y))

def precompute(original_url):
  training_img, training_img_size = prep_image(original_url)
  x_train = np.array(gaussian_filter(training_img, sigma=4))
  
  query_img, query_img_size = prep_image(url, True)
  im2_const = tf.constant(query_img, dtype=tf.float32)
  im2 = Lambda(lambda im1: im2_const)(im1)

  f2 = keras_model(im2)
  d = keras.layers.Dot(1, normalize=True)([f1, f2])

  logit = Lambda(lambda d: inv_logit((d+1)/2))(d)
  model = Model(inputs=[im1], outputs=[logit])
  
  e = shap.DeepExplainer(model, x_train)
  return e

def test_match(match_url, e):
  test_image, size = prep_image(match_url)
  x_test = np.array(test_image)
  shap_values = e.shap_values(x_test, check_additivity=False)
  shap_values_normed = np.array(shap_values)
  shap_values_normed = np.linalg.norm(shap_values_normed, axis=4)
  
  blurred = gaussian_filter(shap_values_normed[0], sigma=4)
  bflat = blurred.flatten()
  shap_values_mask_qi = np.where(np.array(blurred) > np.mean(bflat) + np.std(bflat), 1, 0).reshape(224, 224, 1)
  shap_values_qi = np.multiply(shap_values_mask_qi, x_test[0])
  
  new_size = (224, int(size[1]/size[0]*224)) if size[0] > size[1] else (int(size[0]/size[1]*224), 224)
  original_size = Image.fromarray(shap_values_qi.astype(np.uint8), 'RGB').resize(new_size)
  
  return original_size

# # run before any queries
# keras_model, im1, f1 = setup_model()

# # run only once for each original image
# original_url = "https://mmlsparkdemo.blob.core.windows.net/cknn/datasets/interpret/lex1.jpg" # replace with link to original image
# e = precompute(original_url)

# # run for each new matched image
# match_url = "https://mmlsparkdemo.blob.core.windows.net/cknn/datasets/interpret/lex2.jpg" # replace with link to matched image
# explained_pic = test_match(match_url, e)

def assert_gpu():
    """
    This function will raise an exception if a GPU is not available to tensorflow.
    """
    device_name = tf.test.gpu_device_name()
    if device_name != '/device:GPU:0':
        raise SystemError('GPU device not found')
    print('Found GPU at: {}'.format(device_name))


def init():
    global keras_model, im1, f1
    keras_model, im1, f1 = setup_model()
    print('yay')

def error_response(err_msg):
    """Returns an error response for a given error message

    Arguments:
        err_msg {str} -- error message

    Returns:
        AMLResponse -- response object for the error
    """
    resp = AMLResponse(json.dumps({"error": err_msg}), 400)
    resp.headers['Access-Control-Allow-Origin'] = "*"
    resp.headers['Content-Type'] = "application/json"
    return resp


def success_response(content):
    """Returns a success response with the given content

    Arguments:
        content {any} -- any json serializable data type to send to
        the client

    Returns:
        AMLResponse -- response object for the success
    """
    resp = AMLResponse(json.dumps({"results": content}), 200)
    resp.headers['Access-Control-Allow-Origin'] = "*"
    resp.headers['Content-Type'] = "application/json"
    return resp


@rawhttp
def run(request):
    global e
    print(request)
    if request.method == 'POST':
        try:
            print("HELLO")
            request_data = json.loads(request.data.decode('utf-8'))
            if request_data['original']: #if original!=None
                e = precompute(request_data['original'])
            explained_pic = test_match(request_data['match'],e)
            return success_response(explained_pic)
        except Exception as err:
            traceback.print_exc()
            return error_response(str(err))
    else:  # unsupported http method
        return error_response("invalid http request method")
