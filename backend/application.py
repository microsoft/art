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

# default_artwork = {
#     'img_url': "https://lh3.googleusercontent.com/J-mxAE7CPu-DXIOx4QKBtb0GC4ud37da1QK7CzbTIDswmvZHXhLm4Tv2-1H3iBXJWAW_bHm7dMl3j5wv_XiWAg55VOM=s0", 
#     'title': "De Nachtwacht", 
#     'museum': "Rijksmuseum"
#     }

@app.route('/', methods=['GET'])
def home():
    return "<p>home</p>"

@app.route('/explore', methods=['GET'])
def app_predict():
    for param in ['id', 'museum', 'numResults']:
        if param not in request.args:
            return abort(404, description="missing arguments")
    # prediction = make_prediction(url)
    if int(request.args['numResults']) >= len(dummydata):
        return jsonify(dummydata)
    else:
        return jsonify(dummydata[:int(request.args['numResults'])-1])

@app.route('/select', methods=['GET'])
def id_to_url():
    if 'id' in request.args and 'museum' in request.args:
        try:
            imgid = request.args['id']
            museum = request.args['museum']
        except:
            return abort(404, description="Unable to cast params")
    else:
        return abort(404, description="Missing params")
    for art in dummydata:
        if art['id'] == imgid and art['museum'] == museum:
            return jsonify(art)

@app.route('/search', methods=['GET'])
def search():
    if 'query' in request.args:
        return jsonify(dummydata)
    else:
        return abort(404, description="missing query param")

#DUMMY DATA all rijksmuseum
dummydata = [
    {'title': 'Double Face Banyan'
    'artist': 'anonymous'
    'img_url': 'https://lh3.googleusercontent.com/UPLMPD3V9zcvhCdsLzZAWrJeKFSw4LX6VFdPWQ511mf2PJq0bbxgKBAPh06F32azrOcMS-JWN9xSMlOJMF5vzehgy3c=s0'
    'museum': 'Rijksmuseum'
    'id': 'BK-1978-878'
    }
    {'title': 'Gown (forreau)'
    'artist': 'anonymous'
    'img_url': 'https://lh3.googleusercontent.com/LYRHJKFOWoUffmgMNoo-tyQwQ3ZhIBMhHpgrlZKRy0YhL1BiKaq2dp_KuUxiH0JDKwFg3qxuGIB3Wgajow58A0bJ2d4=s0'
    'museum': 'Rijksmuseum'
    'id': 'BK-16406'
    }
    {'title': 'Black wedding dress'
    'artist': 'W. Wildermann'
    'img_url': 'https://lh6.ggpht.com/BRu2cCzuAhxpglCIsNqVfkpYoDWGM7Fiige8BtKrrbZDiKRKwzsX6XQAPI52HmbqmKG40tr7oRv039AY56wld7vb6Q=s0'
    'museum': 'Rijksmuseum'
    'id': 'BK-1961-105'
    }
    {'title': 'The Annunciation'
    'artist': 'Francesco di Valdambrino'
    'img_url': 'https://lh6.ggpht.com/9lJPKJlmHc5XjEltJLermo1zPgSPDxjWaYmTwFMKrQ02slcp20f-yprSH2pugRbDBrAsW9kB8ZsUULekmOWPFaR9cw=s0'
    'museum': 'Rijksmuseum'
    'id': 'BK-17224-A'
    }
    {'title': 'Floral evening coat'
    'artist': 'anonymous'
    'img_url': 'https://lh6.ggpht.com/kqjCQTYgubojVr1UFU9J043A2i7FRsf2H6rRcUhhTycKqaGgn6RpOBZMxKzbwQMNq8o5Ueqp7tOg4PKiUPSAHaQee7g=s0'
    'museum': 'Rijksmuseum'
    'id': 'BK-1978-879'
    }
    {'title': 'Skirt and Bodice with Beaded Decoration'
    'artist': 'Denise Vandervelde-Borgeaud'
    'img_url': 'https://lh5.ggpht.com/Os4KpKJhBIBNCChtxvWNwolHUSxqvqVXLA_c0X8gLwXO82-V24Vt7kooGjvaj2qBZNme9UbPNTw_q9qQjcZifUGl2g=s0'
    'museum': 'Rijksmuseum'
    'id': 'BK-1986-55-A'
    }
    {'title': 'Jizo bosatsu'
    'artist': 'anonymous'
    'img_url': 'https://lh3.googleusercontent.com/0dMQnP3r9q_tyjhDdj8yBnviRcsBhz20p_bgu4hLa8gd5QuwkHHI-zsmCxgL5HBZ6nbNYaDyMZnWoz1GIvkpCazwGSuj=s0'
    'museum': 'Rijksmuseum'
    'id': 'AK-MAK-116-2'
    }
    {'title': 'Portret van Johan Daniël Koelman'
    'artist': 'Eastman Johnson'
    'img_url': 'https://lh3.googleusercontent.com/FL9OGjSTUsYzlhjUiHWeVpf2QqCjQ8vkqMoBA4ne5VlT2XH0NFF0L7iPumUMvtRyG72yo23jMw3veFipcynk-nXM8hmg=s0'
    'museum': 'Rijksmuseum'
    'id': 'RP-T-2005-170'
    }
    {'title': 'Daoist Deity'
    'artist': 'anonymous'
    'img_url': 'https://lh3.googleusercontent.com/sMLjzu7fs4UriklahCjKCzRJX5MzJoKr77LUkRGWLztpkd3N_Oc9Z8hW86LYQEx2TN7ynW3QlYEt0kFe5Mjfqu5rNL2F=s0'
    'museum': 'Rijksmuseum'
    'id': 'AK-RAK-2014-6'
    }
]