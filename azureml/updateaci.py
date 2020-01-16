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
from azureml.core.webservice import AksWebservice, AciWebservice, Webservice

ws = Workspace(
    subscription_id="ce1dee05-8cf6-4ad6-990a-9c80868800ba",
    resource_group="extern2020",
    workspace_name="exten-amls"
)

# from keras.applications.imagenet_utils import preprocess_input, decode_predictions
# from keras.models import load_model
# from keras.preprocessing import image
# from keras.applications.resnet50 import ResNet50

# model = Model.register(
#     model_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),"my_model.h5"),
#     model_name = "resNet50",
#     workspace = ws)

# myenv = Environment.from_conda_specification(
#     name="myenv", 
#     file_path=os.path.join(os.path.dirname(os.path.realpath(__file__)),"myenv.yml"))

# inference_config = InferenceConfig(
#     entry_script=os.path.join(os.path.dirname(os.path.realpath(__file__)),"score.py"),
#     environment=myenv)

service_name="aci-service"
service = AciWebservice(name=service_name, workspace=ws)
# service.update(models=[model], inference_config=inference_config)
service.update(auth_enabled=False)

print(service.state)
print("scoring URI: " + service.scoring_uri)
