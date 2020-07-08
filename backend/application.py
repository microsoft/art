from flask import Flask, redirect, url_for, request, render_template, jsonify, abort
from werkzeug.utils import secure_filename
import base64

import os
import subprocess
import sys
from io import BytesIO

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

install("azure-storage-blob")
install("flask-cors")
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, ContentSettings
from flask_cors import CORS

connect_str = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
blob_service_client = BlobServiceClient(
    account_url=connect_str
)
container_name = "mosaic-shares"

BAD_REQUEST_STATUS_CODE = 400
NOT_FOUND_STATUS_CODE = 404

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({ "status": "ok", "version": "1.0.0" })

@app.route('/upload', methods=['POST'])
def upload():
    # frontend uploads image, we save to azure storage blob and return a link to the image and the share page
    if request.method == 'POST':
        if request.args.get("filename") is None:
            return jsonify({ "error": "filename parameter must be specified" })
        filename = request.args.get("filename")
        content_type = None
        try:
            img_b64 = request.form.get('image').split(',')
            image = base64.b64decode(img_b64[1])
            content_type = img_b64[0].split(':')[1].split(';')[0] # gets content type from data:image/png;base64
        except:
            return jsonify({ "error": "unable to decode"})

        if allowed_file(filename):
            filename = secure_filename(filename)
            blob_client = blob_service_client.get_blob_client(container=container_name, blob=filename)
            try:
                blob_client.upload_blob(image)
                blob_client.set_http_headers(content_settings = ContentSettings(content_type=content_type))
                print(content_type)
            except Exception as err:
                print(err)
            finally:
                img_url = "https://mmlsparkdemo.blob.core.windows.net/mosaic-shares/mosaic-shares/" + filename
                return jsonify({ "img_url": img_url })
        return jsonify({"error": "error processing file"})
    else:
        return jsonify({"error": "upload is a post request"})

@app.route('/share', methods=['GET'])
def share():
    image_url = request.args.get('image_url')
    title = request.args.get('title')
    description = request.args.get('description')
    redirect_url = request.args.get('redirect_url')
    width = request.args.get('width')
    height = request.args.get('height')
    # input param 'url', we return a page that can be shared with facebook (with correct opengraph tags)
    return render_template(
        "share.html",
        image_url=image_url,
        title=title,
        description=description,
        redirect_url=redirect_url,
        width=width,
        height=height
    )

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')