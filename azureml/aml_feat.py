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
    datastore_name='mosaic_datastore',
    container_name='mosaic',
    account_name='mmlsparkdemo',
    sas_token="?sv=2019-02-02&ss=bf&srt=sco&sp=rlc&se=2030-01-23T04:14:29Z&st=2020-01-22T20:14:29Z&spr=https,http&sig=nPlKziG9ppu4Vt5b6G%2BW1JkxHYZ1dlm39mO2fMZlET4%3D",
    create_if_not_exists=True)

compute_target = ComputeTarget(workspace=ws, name='automl-compute')

exp = Experiment(workspace=ws, name='featurize_artwork')

estimator = Estimator(
    source_directory = "azureml",
    entry_script = "featurize.py",
    script_params = {
        "--data-dir": datastore.as_mount()
    },
    conda_dependencies_file = os.path.join(os.path.dirname(os.path.realpath(__file__)),"myenv.yml"),
    compute_target=compute_target,
    use_docker=True,
    custom_docker_image="mhamilton723/pyspark:0.2"
)

run = exp.submit(estimator)
run.wait_for_completion(show_output = True)

run.register_model(
    model_name="features-culture",
    model_path="outputs/features_culture.ball"
)

run.register_model(
    model_name="features-classification",
    model_path="outputs/features_classification.ball"
)

run.register_model(
    model_name="metadata",
    model_path="outputs/metadata.pkl"
)