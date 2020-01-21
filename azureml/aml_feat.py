from azureml.core.compute import ComputeTarget, AmlCompute
from azureml.core.runconfig import RunConfiguration
from azureml.core import Experiment, Workspace
from azureml.core.environment import Environment
from azureml.core import Datastore
from azureml.core import ScriptRunConfig
from azureml.train.estimator import Estimator
import os 

ws = Workspace(
    subscription_id="ce1dee05-8cf6-4ad6-990a-9c80868800ba",
    resource_group="extern2020",
    workspace_name="exten-amls"
)

datastore = Datastore.register_azure_blob_container(
    workspace=ws,
    datastore_name='artdatarijks',
    container_name='rijks',
    account_name='mmlsparkdemo',
    sas_token="HWlVUfk%2FiAqoFonULFdGV3D8kONZl7W7GuIb0rF3vRw%3D",
    create_if_not_exists=True)

compute_target = ComputeTarget(workspace=ws, name='automl-compute')

exp = Experiment(workspace=ws, name='my_experiment')

estimator = Estimator(
    source_directory = "azureml",
    entry_script = "featurize.py",
    script_params = {
        "--data-dir": datastore.as_mount()
    },
    conda_dependencies_file = os.path.join(os.path.dirname(os.path.realpath(__file__)),"myenv.yml"),
    compute_target=compute_target
)

run = exp.submit(estimator)
run.wait_for_completion(show_output = True)

run.register_model(
    model_name="art-features",
    model_path="outputs/features_resnet.pkl"
)
run.register_model(
    model_name="art-metadata",
    model_path="outputs/metadata_resnet.pkl"
)