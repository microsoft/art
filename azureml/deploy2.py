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
from azureml.core.model import Model

ws = Workspace(
    subscription_id="ce1dee05-8cf6-4ad6-990a-9c80868800ba",
    resource_group="extern2020",
    workspace_name="exten-amls"
)

from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image
from keras.applications.resnet50 import ResNet50
#model = ResNet50(weights="imagenet")
#model.save('my_model.h5')


model = Model.register(model_path = "my_model.h5",
                      model_name = "resNet50",
                      workspace = ws)

#print(model.name, model.id, model.version, sep='\t')

inference_config = InferenceConfig(
    entry_script="score2.py",
    runtime="python",
    conda_file="myenv.yml")

deployment_config = LocalWebservice.deploy_configuration(port=5000)

service = Model.deploy(ws, 'myservice', [model], inference_config, deployment_config)

service.wait_for_deployment(True)
print(service.state)
print("scoring URI: " + service.scoring_uri)


scoring_uri = 'http://localhost:5000'
headers = {'Content-Type':'application/json'}
test_data = json.dumps([[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]])
test_data = "panda.jpg"
response = requests.post(scoring_uri, data=test_data, headers=headers)

print(response.status_code)
print(response.elapsed)
#print(response.json())
