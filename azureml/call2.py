import os
import urllib
import shutil
import azureml
import requests
import json

scoring_uri = 'http://localhost:5000/score'
headers = {'Content-Type':'application/json'}


test_data = json.dumps({"data": [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]]})
test_data = json.dumps({"data": "panda.jpg"})
response = requests.post(scoring_uri, data=test_data, headers=headers)

print(response.status_code)
print(response.elapsed)
print(response.text)