import pickle
import json
import numpy as np
from sklearn.externals import joblib
from sklearn.linear_model import Ridge
from azureml.core.model import Model

import requests
from PIL import Image
from io import BytesIO

from inference_schema.schema_decorators import input_schema, output_schema
from inference_schema.parameter_types.standard_py_parameter_type import StandardPythonParameterType

from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image
from keras.applications.resnet50 import ResNet50


def init():
    global model
    #initialize the model architecture and load in imagenet weights
    model_path = Model.get_model_path('resNet50')
    model = load_model(model_path)

input_sample = "https://wamu.org/wp-content/uploads/2019/12/Bei-Bei-trip-to-china-1500x1266.jpg"
output_sample = "giant_panda"

@input_schema('url', StandardPythonParameterType(input_sample))
@output_schema( StandardPythonParameterType(output_sample))
def run(url):
    try:
        response = requests.get(url) #URL -> response
        img = Image.open(BytesIO(response.content)).resize((224, 224)) #response -> PIL 
        np_img = image.img_to_array(img) #PIL -> numpy
        img_batch = np.expand_dims(np_img, axis=0) #numpy -> batch
        processed_image = preprocess_input(img_batch, mode='caffe') #pre-process img
        preds = model.predict(processed_image) #make prediction on img
        pred_class = decode_predictions(preds, top=1) #decode predition
        return pred_class[0][0][1] #return the prediction
    except Exception as err:
        return str(err)