import keras
import numpy as np
from PIL import Image
import shap
import os
from time import perf_counter
from io import BytesIO
from zipfile import ZipFile
from urllib.request import urlopen
import random
from keras.applications.resnet50 import preprocess_input
from keras.applications.resnet50 import ResNet50
from keras.layers import Input, Lambda
from keras import Model
import tensorflow as tf
from scipy.ndimage.filters import gaussian_filter


start = perf_counter()
resp = urlopen("http://cs231n.stanford.edu/tiny-imagenet-200.zip")
zipfile = ZipFile(BytesIO(resp.read()))

if not os.path.exists("outputs"): os.makedirs("outputs")
random_sample = []
count = 0
jpegs = []
for filename in zipfile.namelist():
    if filename[-5:] == '.JPEG':
        jpegs.append(filename)

random_filenames = random.sample(jpegs, 50)

for f in random_filenames:
    image_data = zipfile.read(f)
    fh = BytesIO(image_data)
    img = Image.open(fh)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    random_sample.append(np.array(img.resize((224, 224))))

random_sample = np.array(random_sample)

def prep_image(path):
  resource = urlopen("https://mmlsparkdemo.blob.core.windows.net/cknn/datasets/interpret/{}".format(path)).read()
  img = Image.open(BytesIO(resource))
  if img.mode != 'RGB':
    img = img.convert('RGB')
  x = np.array(img.resize((224, 224)))
  x = np.expand_dims(x, axis=0)
  return preprocess_input(x)

def prep_image_2(path):
  resource = urlopen("https://mmlsparkdemo.blob.core.windows.net/cknn/datasets/interpret/{}".format(path)).read()
  img = Image.open(BytesIO(resource))
  if img.mode != 'RGB':
    img = img.convert('RGB')
  return np.array(img.resize((224, 224)))

query_img = prep_image('lex1.jpg')

stop = perf_counter()
f = open("outputs/data-sci.txt", "a")
f.write("Preparation: " + str(stop - start) + " seconds\n")
f.close()

start = perf_counter()
keras_model = ResNet50(input_shape=[224, 224, 3],
                           weights='imagenet',
                           include_top=False,
                           pooling='avg')
im1 = Input([224, 224, 3])
f1 = keras_model(im1)
def inv_logit(y):
    return tf.math.log(y/(1-y))
stop = perf_counter()
f = open("outputs/data-sci.txt", "a")
f.write("Defining model part 1: " + str(stop - start) + " seconds\n")
f.close()

start = perf_counter()
im2_const = tf.constant(query_img, dtype=tf.float32)
im2 = Lambda(lambda im1: im2_const)(im1)

f2 = keras_model(im2)
d = keras.layers.Dot(1, normalize=True)([f1, f2])

logit = Lambda(lambda d: inv_logit((d+1)/2))(d)
model = Model(inputs=[im1], outputs=[logit])
stop = perf_counter()
f = open("outputs/data-sci.txt", "a")
f.write("Defining model part 2: " + str(stop - start) + " seconds\n")
f.close()


start = perf_counter()
qi = prep_image_2('lex1.jpg')
mi = prep_image_2('lex2.jpg')
oi = prep_image_2('lex3.jpg')
x_train = random_sample
x_test = np.array([qi, mi])
stop = perf_counter()
f = open("outputs/data-sci.txt", "a")
f.write("Defining data: " + str(stop - start) + " seconds\n")
f.close()

start = perf_counter()
e = shap.DeepExplainer(model, x_train)
stop = perf_counter()
f = open("outputs/data-sci.txt", "a")
f.write("Defining DeepExplainer: " + str(stop - start) + " seconds\n")
f.close()

start = perf_counter()
shap_values = e.explainer.shap_values(x_test, check_additivity=False)
stop = perf_counter()
f = open("outputs/data-sci.txt", "a")
f.write("Defining SHAP values: " + str(stop - start) + " seconds\n")
f.close()


start = perf_counter()
shap_values_normed = np.array(shap_values)
shap_values_normed = np.linalg.norm(shap_values_normed, axis=4)
blurred = [gaussian_filter(pic, sigma=3) for pic in shap_values_normed[0]]
shap_values_mask_qi = np.where(np.array(blurred[0]) > 0.0002, 1, 0).reshape(224, 224, 1)
shap_values_mask_mi = np.where(np.array(blurred[1]) > 0.00007, 1, 0).reshape(224, 224, 1)

shap_values_qi = np.multiply(shap_values_mask_qi, qi)
shap_values_mi = np.multiply(shap_values_mask_mi, mi)
stop = perf_counter()
f = open("outputs/data-sci.txt", "a")
f.write("Post-processing: " + str(stop - start) + " seconds\n")
f.close()