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

model = Model.register(model_path = "my_model.h5",
                      model_name = "resNet50",
                      workspace = ws)

myenv = Environment.from_conda_specification(name="myenv", file_path="myenv.yml")
myenv.docker.base_image = DEFAULT_GPU_IMAGE
inference_config = InferenceConfig(entry_script="score_keras.py",
                                   environment=myenv)

gpu_aks_config = AksWebservice.deploy_configuration(autoscale_enabled=False,
                                                    num_replicas=3,
                                                    cpu_cores=2,
                                                    memory_gb=4)

resource_group = 'extern2020'
cluster_name = 'art-k8s'

attach_config = AksCompute.attach_configuration(resource_group = resource_group,
                                         cluster_name = cluster_name,
                                         cluster_purpose = AksCompute.ClusterPurpose.DEV_TEST) #testing
aks_target = ComputeTarget.attach(ws, 'myaks', attach_config)

aks_service_name = 'art-k8s-service'
service = Model.deploy(ws, 'myservicekeras', [model], inference_config, gpu_aks_config, aks_target, aks_service_name)
service.wait_for_deployment(True)
print(service.state)
print("scoring URI: " + service.scoring_uri)

# Check prediction response with test data
scoring_uri = 'http://localhost:5050/score'
headers = {'Content-Type':'application/json'}
test_data = json.dumps({"url":"https://wamu.org/wp-content/uploads/2019/12/Bei-Bei-trip-to-china-1500x1266.jpg"})
response = requests.post(service.scoring_uri, data=test_data, headers=headers) #changed scoring_uri to service.scoring_uri

print(response.status_code)
print(response.elapsed)
print(response.json())
