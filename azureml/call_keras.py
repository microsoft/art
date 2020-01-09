import os
import urllib
import shutil
import azureml
import requests
import json

scoring_uri = 'http://localhost:5050/score'
headers = {'Content-Type':'application/json'}
test_data = json.dumps({"url":"https://wamu.org/wp-content/uploads/2019/12/Bei-Bei-trip-to-china-1500x1266.jpg"})
# test_data = sys+"panda.jpg"
response = requests.post(scoring_uri, data=test_data, headers=headers)

print(response.status_code)
print(response.elapsed)
print(response.text)
