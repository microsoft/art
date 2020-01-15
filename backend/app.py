from flask import Flask, redirect, url_for, request, render_template, jsonify, abort
from werkzeug.utils import secure_filename

from curated_list import curated_list
from exploredata import exploredata

app = Flask(__name__)

default_artwork = {
    'img_url': "https://lh3.googleusercontent.com/J-mxAE7CPu-DXIOx4QKBtb0GC4ud37da1QK7CzbTIDswmvZHXhLm4Tv2-1H3iBXJWAW_bHm7dMl3j5wv_XiWAg55VOM=s0", 
    'title': "De Nachtwacht", 
    'museum': "Rijksmuseum"
    }

@app.route('/', methods=['GET'])
def home():
    return "<p>home</p>"

@app.route('/explore', methods=['GET'])
def app_predict():
    for param in ['id', 'museum', 'numResults']:
        if param not in request.args:
            jsonify({ "error": "missing the id or museum or numResults parameter" }), 404

    if int(request.args['numResults']) >= len(exploredata):
        return jsonify(exploredata)
    else:
        return jsonify(exploredata[:int(request.args['numResults'])])

@app.route('/select', methods=['GET'])
def id_to_url():
    if 'id' in request.args and 'museum' in request.args:
        for art in exploredata:
            if art['id'] == request.args['id'] and art['museum'] == request.args['museum']:
                return jsonify(art)
    else:
        return jsonify({ "error": "missing the id or museum parameter" }), 404


@app.route('/search', methods=['GET'])
def search():
    if 'query' in request.args:
        return jsonify(exploredata)
    else:
        return jsonify({ "error": "missing query parameter" }), 404

@app.route('/curated', methods=['GET'])
def get_curated_list():
    return jsonify(curated_list)