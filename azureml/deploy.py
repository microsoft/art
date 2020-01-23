import azureml, os, time

from azureml.core import Workspace
from azureml.core.compute import AksCompute, ComputeTarget
from azureml.core.compute_target import ComputeTargetException
from azureml.core.environment import Environment, DEFAULT_GPU_IMAGE
from azureml.core.model import InferenceConfig, Model
from azureml.core.webservice import AksWebservice
from azureml.exceptions import WebserviceException

ws = Workspace(
    subscription_id="ce1dee05-8cf6-4ad6-990a-9c80868800ba",
    resource_group="extern2020",
    workspace_name="exten-amls"
)

myenv = Environment.from_conda_specification(
    name="myenv", 
    file_path=os.path.join(os.path.dirname(os.path.realpath(__file__)),"myenv.yml"))

myenv.docker.base_image = DEFAULT_GPU_IMAGE

inference_config = InferenceConfig(
    entry_script=os.path.join(os.path.dirname(os.path.realpath(__file__)),"score.py"),
    environment=myenv)

resource_group = 'extern2020'
cluster_name = 'aks-gpu2'
service_name = 'artgpuservice'

"""
Creates a cluster if one by the name of cluster_name does not already exist.
Deploys a service to the cluster if one by the name of service_name does not already exist, otherwise it will update the existing service.
"""
try: #if cluster and service exists
    aks_target = AksCompute(ws, cluster_name)
    service = AksWebservice(name=service_name, workspace=ws)
    print("Updating existing service: {}".format(service_name))
    # backoff_time = 60
    # while service.state is "Unschedulable":
    #     print("Service state is unschedulable. Retrying in {} seconds...".format(backoff_time))
    #     time.wait(backoff_time)
    #     backoff_time *= 2 # exponential backoff on unschedulable failure
    service.update(inference_config=inference_config, auth_enabled=False)
    # service.wait_for_deployment(show_output=True)

except WebserviceException: #if cluster but no service
    #creating a new service
    aks_target = AksCompute(ws, cluster_name)
    print("Deploying new service: {}".format(service_name))
    gpu_aks_config = AksWebservice.deploy_configuration(
        autoscale_enabled=False,
        num_replicas=3,
        cpu_cores=2,
        memory_gb=4,
        auth_enabled=False)
    service = Model.deploy(ws, service_name, [], inference_config, gpu_aks_config, aks_target, overwrite=True)
    service.wait_for_deployment(show_output = True)

except ComputeTargetException: #cluster doesn't exist
    print("Creating new cluster: {}".format(cluster_name))
    # Provision AKS cluster with GPU machine
    prov_config = AksCompute.provisioning_configuration(
        vm_size="Standard_NC6",
        cluster_purpose=AksCompute.ClusterPurpose.DEV_TEST)

    # Create the cluster
    aks_target = ComputeTarget.create(
        workspace=ws, name=cluster_name, provisioning_configuration=prov_config
    )
    aks_target.wait_for_completion(show_output=True)

    print("Deploying new service: {}".format(service_name))
    gpu_aks_config = AksWebservice.deploy_configuration(
        autoscale_enabled=False,
        num_replicas=3,
        cpu_cores=2,
        memory_gb=4,
        auth_enabled=False)
    service = Model.deploy(ws, service_name, [], inference_config, gpu_aks_config, aks_target, overwrite=True)
    service.wait_for_deployment(show_output = True)

print("State: " + service.state)
print("Scoring URI: " + service.scoring_uri)
