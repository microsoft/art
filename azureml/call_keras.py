import os
import urllib
import shutil
import azureml
import requests
import json
import sys

scoring_uri = 'http://localhost:5050/score'
headers = {'Content-Type':'application/json'}
print(sys.argv[0])
test_data = json.dumps({"url":sys.argv[1]})
# test_data = sys+"panda.jpg"
response = requests.post(scoring_uri, data=test_data, headers=headers)

print(response.status_code)
print(response.elapsed)
print(response.text)
