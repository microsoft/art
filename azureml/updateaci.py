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

model = Model(ws, "resNet50")

myenv = Environment.from_conda_specification(
    name="myenv", 
    file_path=os.path.join(os.path.dirname(os.path.realpath(__file__)),"myenv.yml"))

inference_config = InferenceConfig(
    entry_script=os.path.join(os.path.dirname(os.path.realpath(__file__)),"score.py"),
    environment=myenv)

service_name="aci-service"
service = AciWebservice(name=service_name, workspace=ws)
service.update(models=[model], inference_config=inference_config)

service.wait_for_deployment(True)

print("Status: " + service.state)
print("Scoring URI: " + service.scoring_uri)
