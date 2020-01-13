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
    model_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),"my_model.h5"),
    model_name = "resNet50",
    workspace = ws)

myenv = Environment.from_conda_specification(
    name="myenv", 
    file_path=os.path.join(os.path.dirname(os.path.realpath(__file__)),"myenv.yml"))
myenv.docker.base_image = DEFAULT_GPU_IMAGE
inference_config = InferenceConfig(
    entry_script=os.path.join(os.path.dirname(os.path.realpath(__file__)),"score.py"),
    environment=myenv)

gpu_aks_config = AksWebservice.deploy_configuration(
    autoscale_enabled=False,
    num_replicas=3,
    cpu_cores=2,
    memory_gb=4,
    auth_enabled=False)

resource_group = 'extern2020'
cluster_name = 'new-aks'

attach_config = AksCompute.attach_configuration(
    resource_group = resource_group,
    cluster_name = cluster_name,
    cluster_purpose = AksCompute.ClusterPurpose.DEV_TEST)
aks_target = AksCompute(ws, cluster_name)

service = Model.deploy(ws, 'myservicekeras', [model], inference_config, gpu_aks_config, aks_target, overwrite=True)

print(service.state)
print("scoring URI: " + service.scoring_uri)
