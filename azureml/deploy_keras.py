import os
import urllib
import shutil
import azureml
import requests
import json

from azureml.core import Experiment
from azureml.core import Workspace, Run
from azureml.core.compute import ComputeTarget, AmlCompute
from azureml.core.compute_target import ComputeTargetException
from azureml.train.dnn import TensorFlow
from azureml.core import Datastore
from azureml.core import ScriptRunConfig
from azureml.core.runconfig import RunConfiguration
from azureml.core.model import InferenceConfig
from azureml.core.environment import Environment
from azureml.core.conda_dependencies import CondaDependencies
from azureml.core.model import Model
from azureml.core.webservice import LocalWebservice

ws = Workspace(
    subscription_id="ce1dee05-8cf6-4ad6-990a-9c80868800ba",
    resource_group="extern2020",
    workspace_name="exten-amls"
)

from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image
from keras.applications.resnet50 import ResNet50

model = Model.register(model_path = "my_model.h5",
                      model_name = "resNet50",
                      workspace = ws)

inference_config = InferenceConfig(
    entry_script="score_keras.py",
    runtime="python",
    conda_file="myenv.yml")

deployment_config = LocalWebservice.deploy_configuration(port=5050)

service = Model.deploy(ws, 'myservicekeras', [model], inference_config, deployment_config)
service.wait_for_deployment(True)
print(service.state)
print("scoring URI: " + service.scoring_uri)

# Check prediction response with test data
scoring_uri = 'http://localhost:5050/score'
headers = {'Content-Type':'application/json'}
test_data = json.dumps({"url":"https://wamu.org/wp-content/uploads/2019/12/Bei-Bei-trip-to-china-1500x1266.jpg"})
response = requests.post(scoring_uri, data=test_data, headers=headers)

print(response.status_code)
print(response.elapsed)
print(response.json())
