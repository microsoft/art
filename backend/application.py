from flask import Flask, redirect, url_for, request, render_template, jsonify, abort
from werkzeug.utils import secure_filename

from curated_list import curated_list
from exploredata import exploredata

BAD_REQUEST_STATUS_CODE = 400
NOT_FOUND_STATUS_CODE = 404

app = Flask(__name__)

default_artwork = {
    'img_url': "https://lh3.googleusercontent.com/J-mxAE7CPu-DXIOx4QKBtb0GC4ud37da1QK7CzbTIDswmvZHXhLm4Tv2-1H3iBXJWAW_bHm7dMl3j5wv_XiWAg55VOM=s0", 
    'title': "De Nachtwacht", 
    'museum': "Rijksmuseum"
    }

@app.route('/', methods=['GET'])
def home():
    return jsonify({ "status": "ok", "version": "1.0.0" })

@app.route('/explore', methods=['GET'])
def explore():
    for param in ['id', 'museum', 'numResults']:
        if param not in request.args:
            jsonify({ "error": "id, museum, and numResults parameter is required" }), BAD_REQUEST_STATUS_CODE
    
    try:
        numResults = int(request.args['numResults'])
    except:
        return jsonify({ "error": "numResults must be an integer" }), BAD_REQUEST_STATUS_CODE

    if numResults >= len(exploredata):
        return jsonify(exploredata)
    else:
        return jsonify(exploredata[:numResults])

@app.route('/select', methods=['GET'])
def select():
    if 'id' in request.args and 'museum' in request.args:
        for art in exploredata:
            if art['id'] == request.args['id'] and art['museum'] == request.args['museum']:
                return jsonify(art)
        
        return jsonify({ "error": "art object with given id and museum not found" }), NOT_FOUND_STATUS_CODE

    else:
        return jsonify({ "error": "id and museum parameter is required" }), BAD_REQUEST_STATUS_CODE


@app.route('/search', methods=['GET'])
def search():
    if 'query' in request.args:
        return jsonify(exploredata)
    else:
        return jsonify({ "error": "query parameter is required" }), BAD_REQUEST_STATUS_CODE

@app.route('/curated', methods=['GET'])
def curated():
    return jsonify(curated_list)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')