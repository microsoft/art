import pickle
import json
import numpy as np
from sklearn.externals import joblib
from sklearn.linear_model import Ridge
from azureml.core.model import Model

from inference_schema.schema_decorators import input_schema, output_schema
from inference_schema.parameter_types.numpy_parameter_type import NumpyParameterType

from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image
from keras.applications.resnet50 import ResNet50


def init():
    global model
    #initialize the model architecture and load in imagenet weights
    model = ResNet50(weights='imagenet')

input_sample = "panda.jpg"
output_sample = "panda"


@input_schema('data', NumpyParameterType(input_sample))
@output_schema(NumpyParameterType(output_sample))

def run(data):
    try:
        original = image.load_img(data, target_size=(224, 224)) #load image in PIL format
        np_img = image.img_to_array(original) #PIL -> numpy
        img_batch = np.expand_dims(np_img, axis=0) #numpy -> batch
        processed_image = preprocess_input(img_batch, mode='caffe') #pre-process img
        preds = model.predict(processed_image) #make prediction on img
        pred_class = decode_predictions(preds, top=1) #decode predition
        return pred_class[0][0][1] #return the prediction
    except Exception as e:
        error = str(e)
        return error
