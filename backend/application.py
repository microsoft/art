import pickle
import json
import numpy as np
import requests
from PIL import Image
from io import BytesIO

from flask import Flask, redirect, url_for, request, render_template, jsonify
from werkzeug.utils import secure_filename
# from gevent.pywsgi import WSGIServer

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return "<p>home</p>"

@app.route('/predict', methods=['GET'])
def app_predict():
    if 'url' in request.args:
        url = request.args['url'] #just to make sure
    else:
        return "no url..."
    prediction = make_prediction(url)
    results = [{'url': url, 'title': prediction, 'museum': "museum test"} for i in range(5)]
    return jsonify(results)

@app.route('/select', methods=['GET'])
def id_to_url():
    if 'id' in request.args and 'museum' in request.args:
        imgid = int(request.args['id'])
        museum = str(request.args['museum'])
    else:
        return 'no id...'
    return jsonify({'imgurl': 'url', 'title': 'title', 'museum':museum})

app.run(debug=True,threaded=False)