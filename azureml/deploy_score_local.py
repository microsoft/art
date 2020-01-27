import os
from azureml.core import Workspace
from azureml.core.environment import Environment
from azureml.core.model import InferenceConfig, Model
from azureml.core.webservice import LocalWebservice, Webservice

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
    base_image="typingkoala/art-repository:latest")

model = Model(ws, name="features")

deployment_config = LocalWebservice.deploy_configuration(port=8890)

service = Model.deploy(ws, "scoring", [model], inference_config, deployment_config)
service.wait_for_deployment(show_output = True)
print(service.state)