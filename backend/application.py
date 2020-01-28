from flask import Flask, redirect, url_for, request, render_template, jsonify, abort
from werkzeug.utils import secure_filename

import os
import subprocess
import sys

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

install("azure-storage-blob")
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient

connect_str = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
blob_service_client = BlobServiceClient(
    account_url=connect_str
)
container_name = "mosaic-shares"

BAD_REQUEST_STATUS_CODE = 400
NOT_FOUND_STATUS_CODE = 404

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return jsonify({ "status": "ok", "version": "1.0.0" })

@app.route('/upload', methods=['POST'])
def upload():
    # frontend uploads image, we save to azure storage blob and return a link to the image and the share page
    if request.method == 'POST':
        if request.form.get('image'):
            upload_file_path = './images/test.txt'
            file = open('./images','w')
            file.write(request.form.get('image'))
            file.close()
            blob_client = blob_service_client.get_blob_client(container=container_name,blob=upload_file_path)
            with open(upload_file_path,"rb") as data:
                blob_client.upload_blob(data)
        else:
            return jsonify({"error": "img not found"})
    else:
        return jsonify({"error": "upload is a post request"})

@app.route('/share', methods=['GET'])
def share():
    image_url = request.args.get('image_url')
    title = request.args.get('title')
    description = request.args.get('description')
    # input param 'url', we return a page that can be shared with facebook (with correct opengraph tags)
    return render_template(
        "share.html",
        image_url=image_url,
        title=title,
        description=description
    )

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')