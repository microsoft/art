import azureml, json, os, requests, shutil, urllib

from azureml.core import Datastore, Experiment, Run, ScriptRunConfig, Workspace
from azureml.core.compute import AksCompute, AmlCompute, ComputeTarget
from azureml.core.compute_target import ComputeTargetException
from azureml.core.conda_dependencies import CondaDependencies
from azureml.core.environment import Environment, DEFAULT_GPU_IMAGE
from azureml.core.model import InferenceConfig, Model
from azureml.core.runconfig import RunConfiguration
from azureml.core.webservice import AksWebservice
from azureml.exceptions import WebserviceException
from azureml.train.dnn import TensorFlow
from keras.applications.imagenet_utils import decode_predictions, preprocess_input
from keras.applications.resnet50 import ResNet50
from keras.models import load_model
from keras.preprocessing import image

ws = Workspace(
    subscription_id="ce1dee05-8cf6-4ad6-990a-9c80868800ba",
    resource_group="extern2020",
    workspace_name="exten-amls"
)

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
cluster_name = 'aks-gpu-new'
service_name = 'artgpuservice'

"""
Creates a cluster if one by the name of cluster_name does not already exist.
Deploys a service to the cluster if one by the name of service_name does not already exist, otherwise it will update the existing service.
"""
try: #if cluster and service exists
    aks_target = AksCompute(ws, cluster_name)
    print("Updating existing service...")
    service = AksWebservice(name=service_name, workspace=ws)
    service.update(models=[model], inference_config=inference_config)
    service.wait_for_deployment(show_output=True)

except WebserviceException: #if cluster but no service
    print("Deploying new service...")
    #creating a new service
    attach_config = AksCompute.attach_configuration(
        resource_group = resource_group,
        cluster_name = cluster_name,
        cluster_purpose = AksCompute.ClusterPurpose.DEV_TEST)
    aks_target = AksCompute(ws, cluster_name)

    gpu_aks_config = AksWebservice.deploy_configuration(
        autoscale_enabled=False,
        num_replicas=3,
        cpu_cores=2,
        memory_gb=4,
        auth_enabled=False)
    service = Model.deploy(ws, service_name, [model], inference_config, gpu_aks_config, aks_target, overwrite=True)
    service.wait_for_deployment(show_output = True)

except ComputeTargetException: #cluster doesn't exist
    print("Creating new cluster...")
    # Provision AKS cluster with GPU machine
    prov_config = AksCompute.provisioning_configuration(
        vm_size="Standard_NC6",
        cluster_purpose=AksCompute.ClusterPurpose.DEV_TEST)

    # Create the cluster
    aks_target = ComputeTarget.create(
        workspace=ws, name=cluster_name, provisioning_configuration=prov_config
    )
    aks_target.wait_for_completion(show_output=True)

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
