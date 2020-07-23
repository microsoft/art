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
from keras.applications.resnet50 import ResNet50, preprocess_input
from pyspark.sql import SparkSession

ALL_CLASSIFICATIONS = {'prints', 'drawings', 'ceramics', 'textiles', 'paintings', 'accessories', 'photographs', "glass",
                       "metalwork", "sculptures", "weapons", "stone", "precious", "paper", "woodwork", "leatherwork",
                       "musical instruments", "uncategorized"}

ALL_CULTURES = {'african (general)', 'american', 'ancient american', 'ancient asian', 'ancient european',
                'ancient middle-eastern', 'asian (general)',
                'austrian', 'belgian', 'british', 'chinese', 'czech', 'dutch', 'egyptian', 'european (general)',
                'french',
                'german', 'greek',
                'iranian', 'italian', 'japanese', 'latin american', 'middle eastern', 'roman', 'russian', 'south asian',
                'southeast asian',
                'spanish', 'swiss', 'various'}


def assert_gpu():
    """
    This function will raise an exception if a GPU is not available to tensorflow.
    """
    device_name = tf.test.gpu_device_name()
    if device_name != '/device:GPU:0':
        raise SystemError('GPU device not found')
    print('Found GPU at: {}'.format(device_name))


def init():
    global culture_model
    global classification_model
    global metadata
    global keras_model

    os.environ["CUDA_VISIBLE_DEVICES"] = str(0)
    assert_gpu()
    print("Initializing Spark")

    # downloading java dependencies
    print(os.environ.get("JAVA_HOME", "WARN: No Java home found"))
    SparkSession.builder \
        .master("local[*]") \
        .appName("TestConditionalBallTree") \
        .config("spark.jars.packages", "com.microsoft.ml.spark:mmlspark_2.11:1.0.0-rc1-38-a6970b95-SNAPSHOT") \
        .config("spark.jars.repositories", "https://mmlspark.azureedge.net/maven") \
        .config("spark.driver.memory", "32g") \
        .config("spark.executor.heartbeatInterval", "60s") \
        .getOrCreate()

    print("Spark Initialized")


    from mmlspark.nn.ConditionalBallTree import ConditionalBallTree


    print("Downloading Models")

    if not os.path.exists("medium.ball"):
        print("Downloading medium")
        os.system('wget https://mmlsparkdemo.blob.core.windows.net/mosaic/medium.ball')
        print("downloaded medium")

    if not os.path.exists('culture.ball'):
        print("Downloading culture")
        os.system('wget https://mmlsparkdemo.blob.core.windows.net/mosaic/culture.ball')
        print("downloaded culture")

    # initialize the model architecture and load in imagenet weights

    culture_model = ConditionalBallTree.load('culture.ball')
    classification_model = ConditionalBallTree.load('medium.ball')

    # Model for featurizing
    keras_model = ResNet50(
        input_shape=[225, 225, 3],
        weights='imagenet',
        include_top=False,
        pooling='avg'
    )


def get_similar_images(img, culture=None, classification=None, n=5):
    """Return an n-size array of image objects similar to the pillow image provided
    using the culture or classification as a filter. If no filter is given, it filters on
    all known classifications.

    Arguments:
        img {Image} -- Pillow image to compare to
        culture {str} -- string of the culture to filter
        classification {str} -- string of the classification to filter
        n {int} -- number of results to return

    Returns:
        dict[] -- array of dictionaries representing artworks that are similar
    """
    # Non RGB images won't have the right number of channels
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img = np.array(img)  # PIL -> numpy
    img = np.expand_dims(img, axis=0)
    img = preprocess_input(img.astype(np.float))

    features = keras_model.predict(img)  # featurize
    features /= np.linalg.norm(features)
    img_feature = features[0]
    img_feature = img_feature.tolist()

    # Get results based upon the filter provided
    if culture is not None:
        result = culture_model.findMaximumInnerProducts(
            img_feature,
            {culture},
            n
        )
        selected_model = culture_model
    elif classification is not None:
        result = classification_model.findMaximumInnerProducts(
            img_feature,
            {classification},
            n
        )
        selected_model = classification_model
    else:
        result = classification_model.findMaximumInnerProducts(
            img_feature,
            ALL_CLASSIFICATIONS,
            n
        )
        selected_model = classification_model

    results_with_data = []
    for r in result:
        row = selected_model._jconditional_balltree.values().apply(r[0])
        dist = r[1]
        results_with_data.append([json.loads(row), dist])
    return results_with_data


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
    print(request)
    if request.method == 'POST':
        try:
            request_data = json.loads(request.data.decode('utf-8'))
            response = requests.get(request_data['url'])  # URL -> response
            img = Image.open(BytesIO(response.content)).resize((225, 225))  # response -> PIL
            query = request_data.get('query', None)
            culture = query if query in ALL_CULTURES else None
            classification = query if query in ALL_CLASSIFICATIONS else None
            similar_images = get_similar_images(
                img,
                culture=culture,
                classification=classification,
                n=int(request_data['n'])
            )
            return success_response(similar_images)
        except Exception as err:
            traceback.print_exc()
            return error_response(str(err))

    else:  # unsupported http method
        return error_response("invalid http request method")
