import json
import os
import pickle
 from io import BytesIO

import numpy as np
import requests
from azureml.contrib.services.aml_request import AMLRequest, rawhttp
from azureml.contrib.services.aml_response import AMLResponse
from azureml.core.model import Model
from keras.applications.resnet50 import ResNet50, preprocess_input
from PIL import Image
from pyspark.sql import SparkSession

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
        .config("spark.jars.packages", "com.microsoft.ml.spark:mmlspark_2.11:1.0.0-rc1-41-ccc4ceef-SNAPSHOT") \
        .config("spark.jars.repositories", "https://mmlspark.azureedge.net/maven") \
        .config("spark.executor.heartbeatInterval", "60s") \
        .getOrCreate()

    #initialize the model architecture and load in imagenet weights
    model_path = Model.get_model_path('features')

    culture_model = ConditionalBallTree.load(
        os.path.join(model_path, "features_culture.ball")
    )
    classification_model = ConditionalBallTree.load(
        os.path.join(model_path, "features_classification.ball")
    )
    metadata = pickle.load(open(os.path.join(model_path, "metadata.pkl"), 'rb'))

    # model for featurizing
    keras_model = ResNet50(
        input_shape=[225, 225, 3],
        weights='imagenet',
        include_top=False,
        pooling='avg'
    )

@rawhttp
def run(request):
    if request.method != 'GET':
        return AMLResponse(json.dumps({ "error": "invalid http request method" }), 400)
    if request.args.get('url') and request.args.get('n') and (
        request.args.get('culture') or request.args.get('classification')
    ):
        try:
            response = requests.get(request.args.get('url')) #URL -> response
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
            # return AMLResponse(json.dumps(img_feature.tolist()), 200)

            if request.args.get('culture', None) is not None:
                result = culture_model.findMaximumInnerProducts(
                    img_feature, 
                    {request.args.get('culture')}, 
                    request.args.get('n')
                )
            else:
                result = classification_model.findMaximumInnerProducts(
                    img_feature, 
                    {request.args.get('classificaton')}, 
                    request.args.get('n')
                )
            # find actual info
            # resultmetadata = [metadata[r[0]] for r in result] # list of metadata: museum, id, url, culture, classification
            return resultmetadata
        except Exception as err:
            return AMLResponse(json.dumps({ "error": err }), 500)
    else: # parameters incorrect
        return AMLResponse(json.dumps({ "error": "url, n, and (culture or classification) are required query parameters"}), 400)
