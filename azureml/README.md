# Model Training and Inference

- [Model Training and Inference](#model-training-and-inference)
  - [File Structure](#file-structure)
  - [Environment](#environment)
  - [Training](#training)
  - [Service Deployment](#service-deployment)

Mosaic allows users to find similar artworks by featurizing artwork images using a pretrained Keras model, normalizing the resultant vector, and loading them into a ball tree to quickly query for other artwork with similar featurizations filtered by either culture or classification (m).

## File Structure

This folder contains various scripts and configuration files that either are deployed on Azure or automate the deployment process.

- `featurize.py` is deployed to Azure Machine Learning as an experiment to read image metadata from a mounted Azure Storage blob, download the images, featurize the images, and save them into a ball tree in the file system.

- `deploy_featurize.py` automates the deployment of `featurize.py` by mounting the storage blob, spinning up a GPU cluster, and running the experiment on the cluster. Once the experiment is complete, it registers the entire `output/` folder as a model named `mosaic_model`

- `score.py` is deployed to Azure Machine Learning as a web service that allows clients to query the model. An initialization function `init()` loads the model (trained by `featurize.py`) from disk and optionally asserts that Tensorflow is able to detect a GPU. In `run(request)`, we receive an `AMLRequest` object where we can read the entire request object (HTTP method, query params, etc.) to determine the inputs for running model inference. We query the model and return the list of similar artwork filtered by the request parameters.

- `deploy_score_local.py` runs an instance of `score.py` for local debugging. It builds the Docker image and saves it in the local Docker images. It then attempts to run the Docker container and gives the user a URL to access the inference server if successful. Runtime ranges from 5-20 minutes.

- `deploy_score_aks.py` runs an instance of `score.py` in an AKS cluster. It attempts to attach to a cluster and service if already running, otherwise it creates a service on an existing or new cluster. It then deploys the model and script onto the cluster. Runtime ranges from 10-20 minutes.

- `./GPU_Docker/Dockerfile` is a Dockerfile that specifies how to build the base image for training and scoring. It includes `tensorflow-gpu` for GPU drivers, `Java` for `pyspark`, and an installation of `Anaconda`. 
  <!---All references to `typingkoala/art-repository:latest` are the --->d

- `call_service.py` is a script that makes a post request to our web service, printing the response.

## Environment

Dependencies for the environment:

- Python 3.6.2 (or above)
- Tensorflow GPU
- numpy
- keras
- Pillow
- pyspark
- azureml-defaults[services]
- tqdm
- Docker:
  - start from tensorflow:1.13.2-gpu and set up a Docker image, more details in `./GPU_Docker/Dockerfile`.


## Training

The Ball Tree API originates from [MMLSpark](https://github.com/Azure/mmlspark). It allows for the initialization of a conditional ball tree with three methods: `findMaximumInnerProducts`, `save`, and `load`.
The featurization of the images and the creation of the balltrees is done in `featurize.py`. The file reads a csv from a mounted storage blob and downloads the images from the provided urls. The images are featurized using the embeddings from ResNet50 and then used to create balltree objects.

The training is run through `deploy_featurize.py` as an experiment on Azure Machine Learning (AML). It mounts the storage blob for `featurize.py`, submits the run, then saves the balltree objects and metadata in a model to be referenced later.

This can be run either through AML training clusters or locally to speed up the dev loop. Make sure the [workspace settings](https://docs.microsoft.com/en-us/python/api/azureml-core/azureml.core.workspace.workspace?view=azure-ml-py) are correct before running. The settings of the cluster can be altered in provisioning_config, such as vm size and number of nodes. Setting min_nodes = 0 will allow the cluster to scale to 0 nodes when not in use. To run locally, the container can be downloaded from Azure Container Registry, but only after you run it through AML. The repository URL can be found through Azure Container Registry, and will resemble `extenamls.azurecr.io/azureml/azureml_0062a8f080ece0d27d:latest`.

```bash
docker run -d -it --name <name> --mount type=bind,source=<source_directory>,target=/app <repository_url>
```

The docker exec command will enable debugging through the docker bash terminal

```bash
docker exec -it <name> bash
```

## Service Deployment

`score.py` is a web service that allows for clients to query our model. It handles GET requests, expecting the following parameters: `url`, `n`, `culture` or `classification.ation`. It loads the balltrees and metadata pickle created in `featurize.py`, then downloads the provided URL and featurizes it. The featurized image is put into either the culture or classifcation balltree along with the number of results desired, returning the closest matches. The metadata for the results is then sent as a serialized JSON object.

The web service is deployed through `deploy_score_aks.py` to an inference cluster on Azure Kupernetes Service. It tries to first update an existing service, but if that fails it will create either a new service or a new cluster and service.

The service can be deployed to a cluster or locally. Make sure the [workspace settings](https://docs.microsoft.com/en-us/python/api/azureml-core/azureml.core.workspace.workspace?view=azure-ml-py) are correct before running. The settings for the inference cluster can be changed in gpu_aks_config. To deploy it locally, run `deploy_score_local.py`.