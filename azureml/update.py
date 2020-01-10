import os
import urllib
import shutil
import azureml
import requests
import json

from azureml.core import Experiment
from azureml.core import Workspace, Run
from azureml.core.compute import ComputeTarget, AmlCompute, AksCompute
from azureml.core.compute_target import ComputeTargetException
from azureml.train.dnn import TensorFlow
from azureml.core import Datastore
from azureml.core import ScriptRunConfig
from azureml.core.runconfig import RunConfiguration
from azureml.core.model import InferenceConfig
from azureml.core.environment import Environment, DEFAULT_GPU_IMAGE
from azureml.core.conda_dependencies import CondaDependencies
from azureml.core.model import Model
from azureml.core.webservice import AksWebservice

ws = Workspace(
    subscription_id="ce1dee05-8cf6-4ad6-990a-9c80868800ba",
    resource_group="extern2020",
    workspace_name="exten-amls"
)

from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image
from keras.applications.resnet50 import ResNet50

model = Model.register(
    model_path = "my_model.h5",
    model_name = "resNet50",
    workspace = ws)

myenv = Environment.from_conda_specification(name="myenv", file_path="myenv.yml")
myenv.docker.base_image = DEFAULT_GPU_IMAGE

inference_config = InferenceConfig(
    entry_script="score.py",
    environment=myenv)
    
service = AksWebservice(name="myservicekeras", workspace=ws)

service.update(models=[model], inference_config=inference_config)

print(service.state)
print("scoring URI: " + service.scoring_uri)
