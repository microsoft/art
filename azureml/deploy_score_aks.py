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

inference_config = InferenceConfig(
    entry_script="score.py",
    runtime="python",
    source_directory="azureml",
    conda_file="myenv.yml",
    base_image="typingkoala/mosaic_base_image:1.0.0")

model = Model(ws, name="mosaic_model")

resource_group = 'extern2020'
cluster_name = 'aks-gpu2'
service_name = 'artgpuservice'

"""
Creates a cluster if one by the name of cluster_name does not already exist.
Deploys a service to the cluster if one by the name of service_name does not already exist, otherwise it will update the existing service.
"""
try: # If cluster and service exists
    aks_target = AksCompute(ws, cluster_name)
    service = AksWebservice(name=service_name, workspace=ws)
    # print(service.get_logs(num_lines=5000))
    print("Updating existing service: {}".format(service_name))
    service.update(inference_config=inference_config, auth_enabled=False)
    service.wait_for_deployment(show_output=True)

except WebserviceException: # If cluster but no service
    # Creating a new service
    aks_target = AksCompute(ws, cluster_name)
    print("Deploying new service: {}".format(service_name))
    gpu_aks_config = AksWebservice.deploy_configuration(
        autoscale_enabled=False,
        num_replicas=1,
        cpu_cores=2,
        memory_gb=8,
        auth_enabled=False)
    service = Model.deploy(ws, service_name, [model], inference_config, gpu_aks_config, aks_target, overwrite=True)
    service.wait_for_deployment(show_output = True)

except ComputeTargetException: # If cluster doesn't exist
    print("Creating new cluster: {}".format(cluster_name))
    # Provision AKS cluster with GPU machine
    prov_config = AksCompute.provisioning_configuration(
        vm_size="Standard_NC6",
        cluster_purpose=AksCompute.ClusterPurpose.DEV_TEST)

    # Create the cluster
    aks_target = ComputeTarget.create(
        workspace=ws, name=cluster_name, provisioning_configuration=prov_config, 
    )
    aks_target.wait_for_completion(show_output=True)

    print("Deploying new service: {}".format(service_name))
    gpu_aks_config = AksWebservice.deploy_configuration(
        autoscale_enabled=False,
        num_replicas=3,
        cpu_cores=2,
        memory_gb=4,
        auth_enabled=False)
    service = Model.deploy(ws, service_name, [model], inference_config, gpu_aks_config, aks_target, overwrite=True)
    service.wait_for_deployment(show_output = True)

print("State: " + service.state)
print("Scoring URI: " + service.scoring_uri)
