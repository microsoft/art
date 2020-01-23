import pickle
import json
import numpy as np
from azureml.core.model import Model

import requests
from PIL import Image
from io import BytesIO

from inference_schema.schema_decorators import input_schema, output_schema
from inference_schema.parameter_types.standard_py_parameter_type import StandardPythonParameterType

from keras.applications.resnet50 import preprocess_input
from keras.applications.resnet50 import ResNet50

from ConditionalBallTree import ConditionalBallTree


def init():
    global culture_model
    global classification_model
    global metadata
    global keras_model

    # downloading java dependencies
    spark = SparkSession.builder \
        .master("local[*]") \
        .appName("TestConditionalBallTree") \
        .config("spark.jars.packages", "com.microsoft.ml.spark:mmlspark_2.11:1.0.0-rc1-38-cf48d53c-SNAPSHOT") \
        .config("spark.jars.repositories", "https://mmlspark.azureedge.net/maven") \
        .config("spark.executor.heartbeatInterval", "60s") \
        .getOrCreate()

    #initialize the model architecture and load in imagenet weights
    features_culture_path = Model.get_model_path('features_culture')
    features_classification_path = Model.get_model_path('features_classification')
    metadata_path = Model.get_model_path('metadata')
    
    culture_model = ConditionalBallTree().load(features_culture_path)
    classification_model = ConditionalBallTree().load(features_classification_path)
    metadata = pickle.load(open(metadata_path, 'rb'))

    # model for featurizing
    keras_model = ResNet50(
        input_shape=[img_width, img_height, 3],
        weights='imagenet',
        include_top=False,
        pooling='avg'
    )

input_sample = "https://wamu.org/wp-content/uploads/2019/12/Bei-Bei-trip-to-china-1500x1266.jpg"
output_sample = "giant_panda"

@input_schema('url', StandardPythonParameterType(input_sample))
@input_schema('n', StandardPythonParameterType('5'))
@input_schema('param', StandardPythonParameterType('French'))
@input_schema('paramtype', StandardPythonParameterType('culture'))
@output_schema( StandardPythonParameterType(output_sample))
def run(url, n, paramtype, param):
    try:
        response = requests.get(url) #URL -> response
        img = Image.open(BytesIO(response.content)).resize((225, 225)) #response -> PIL 
        # non RGB images won't have the right number of channels
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img = np.array(img) #PIL -> numpy
        img = np.expand_dims(img, axis=0)
        img = preprocess_input(img.astype(np.float))

        features = keras_model.predict(img) # featurize
        features /= np.linalg.norm(features)
        img_feature = features[0]

        if paramtype == 'culture':
            result = culture_model.findMaximumInnerProducts(img_feature, {param}, n)
        else:
            result = classification_model.findMaximumInnerProducts(img_feature, {param}, n)
        # find actual info
        resultmetadata = [metadata[r[0]] for r in result] # list of metadata: museum, id, url, culture, classification
        return resultmetadata
    except Exception as err:
        return str(err)