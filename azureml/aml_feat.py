from azureml.core.compute import ComputeTarget, AmlCompute
from azureml.core.runconfig import RunConfiguration
from azureml.core import Experiment, Workspace
from azureml.core.environment import Environment

from azureml.core import ScriptRunConfig
import os 

myenv = Environment.from_conda_specification(
    name="myenv", 
    file_path=os.path.join(os.path.dirname(os.path.realpath(__file__)),"myenv.yml"))

# Create a new runconfig object
run_temp_compute = RunConfiguration(conda_dependencies=True)

run_temp_compute.environment=myenv

# Signal that you want to use AmlCompute to execute the script
run_temp_compute.target = "amlcompute"

# AmlCompute is created in the same region as your workspace
# Set the VM size for AmlCompute from the list of supported_vmsizes
run_temp_compute.amlcompute.vm_size = 'STANDARD_D2_V2'

experiment_name = 'my_experiment'

ws = Workspace(
    subscription_id="ce1dee05-8cf6-4ad6-990a-9c80868800ba",
    resource_group="extern2020",
    workspace_name="exten-amls"
)

exp = Experiment(workspace=ws, name=experiment_name)

src = ScriptRunConfig(source_directory = 'azureml', script = 'featurize.py', run_config = run_temp_compute)
run = exp.submit(src)
run.wait_for_completion(show_output = True)
