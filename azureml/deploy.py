import azureml, json, os, requests, shutil, urllib

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

resource_group = 'extern2020'
cluster_name = 'art-aks'
service_name = 'myserviceart'

# try:
#     aks_target = AksCompute(ws, cluster_name)
#     print("Updating existing service...")
#     service = AksWebservice(name=service_name, workspace=ws)
#     service.update(models=[model], inference_config=inference_config)
#     service.wait_for_deployment(show_output=True)
# except ComputeTargetException:
# cluster doesn't exist
print("Creating newservice...")
# Provision AKS cluster with GPU machine
# prov_config = AksCompute.provisioning_configuration(
#     vm_size="Standard_NC6",
#     cluster_purpose=AksCompute.ClusterPurpose.DEV_TEST)

# # Create the cluster
# aks_target = ComputeTarget.create(
#     workspace=ws, name=cluster_name, provisioning_configuration=prov_config
# )
# aks_target.wait_for_completion(show_output=True)
#just attach to cluster

attach_config = AksCompute.attach_configuration(
    resource_group = resource_group,
    cluster_name = cluster_name,
    cluster_purpose = AksCompute.ClusterPurpose.DEV_TEST)
aks_target = AksCompute(ws, cluster_name)

print("Deploying new service...")
gpu_aks_config = AksWebservice.deploy_configuration(
    autoscale_enabled=False,
    num_replicas=3,
    cpu_cores=2,
    memory_gb=4,
    auth_enabled=False)
service = Model.deploy(ws, service_name, [model], inference_config, gpu_aks_config, aks_target, overwrite=True)
service.wait_for_deployment(show_output = True)

print(service.state)
print("scoring URI: " + service.scoring_uri)
