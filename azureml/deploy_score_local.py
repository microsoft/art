from azureml.core import Workspace
from azureml.core.model import InferenceConfig, Model
from azureml.core.webservice import LocalWebservice

# Set your workspace
ws = Workspace(
    subscription_id="ce1dee05-8cf6-4ad6-990a-9c80868800ba",
    resource_group="extern2020",
    workspace_name="exten-amls"
)

# Settings for deployment
inference_config = InferenceConfig(
    entry_script="score.py",
    runtime="python",
    source_directory="azureml",
    conda_file="myenv.yml",
    base_image="typingkoala/mosaic_base_image:1.0.0")

# Load existing model
model = Model(ws, name="mosaic_model")

# Deploy model locally
deployment_config = LocalWebservice.deploy_configuration(port=8890)
service = Model.deploy(ws, "scoring", [model], inference_config, deployment_config)

service.wait_for_deployment(show_output = True)
print(service.state)