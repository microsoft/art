# import pickle
# import json
# import numpy as np
# from sklearn.externals import joblib
# from sklearn.linear_model import Ridge
# from azureml.core.model import Model

# import requests
# from PIL import Image
# from io import BytesIO

# from inference_schema.schema_decorators import input_schema, output_schema
# from inference_schema.parameter_types.standard_py_parameter_type import StandardPythonParameterType

# from keras.applications.imagenet_utils import preprocess_input, decode_predictions
# from keras.models import load_model
# from keras.preprocessing import image
# from keras.applications.resnet50 import ResNet50

from flask import Flask, redirect, url_for, request, render_template, jsonify, abort
from werkzeug.utils import secure_filename
# from gevent.pywsgi import WSGIServer

app = Flask(__name__)

# #initialize the model architecture and load in imagenet weights
# model_path = Model.get_model_path('resNet50')
# model = load_model(model_path)

# input_sample = "https://wamu.org/wp-content/uploads/2019/12/Bei-Bei-trip-to-china-1500x1266.jpg"
# output_sample = "giant_panda"

# @input_schema('url', StandardPythonParameterType(input_sample))
# @output_schema( StandardPythonParameterType(output_sample))
# def make_prediction(url):
#     try:
#         response = requests.get(url) #URL -> response
#         img = Image.open(BytesIO(response.content)).resize((224, 224)) #response -> PIL 
#         print('img after')
#         np_img = image.img_to_array(img) #PIL -> numpy
#         img_batch = np.expand_dims(np_img, axis=0) #numpy -> batch
#         print('after batch')
#         processed_image = preprocess_input(img_batch, mode='caffe') #pre-process img
#         print('after process')
#         print(processed_image)
#         preds = model.predict(processed_image) #make prediction on img
#         print('after preds')
#         pred_class = decode_predictions(preds, top=1) #decode predition
#         return pred_class[0][0][1] #return the prediction
#     except Exception as err:
#         return str(err)

@app.route('/', methods=['GET'])
def home():
    return "<p>home</p>"

@app.route('/explore', methods=['GET'])
def app_predict():
    for param in ['id', 'museum', 'numResults']:
        if param not in request.args:
            return abort(404, description="missing arguments")
    # prediction = make_prediction(url)
    results = [{'url': url, 'title': "prediction", 'museum': "museum test"} for i in range(int(request.args['numResults']))]
    return jsonify(results)

@app.route('/select', methods=['GET'])
def id_to_url():
    if 'id' in request.args and 'museum' in request.args:
        try:
            imgid = int(request.args['id'])
            museum = str(request.args['museum'])
        except:
            return abort(404, description="Unable to cast params")
    else:
        return abort(404, description="Missing params")

    return jsonify({'img_url': 'url', 'title': 'title', 'museum': museum})

@app.route('/search', methods=['GET'])
def search():
    if 'query' in request.args:
        results = [{'url': url, 'title': "prediction", 'museum': "museum test"} for i in range(5)]
        return jsonify(results)
    else:
        return abort(404, description="missing query param")