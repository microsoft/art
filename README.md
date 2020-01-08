---
page_type: sample
languages:
- csharp
products:
- dotnet
description: "Add 150 character max description"
urlFragment: "update-this-to-unique-url-stub"
---

# Official Microsoft Sample

<!-- 
Guidelines on README format: https://review.docs.microsoft.com/help/onboard/admin/samples/concepts/readme-template?branch=master

Guidance on onboarding samples to docs.microsoft.com/samples: https://review.docs.microsoft.com/help/onboard/admin/samples/process/onboarding?branch=master

Taxonomies for products and languages: https://review.docs.microsoft.com/new-hope/information-architecture/metadata/taxonomies?branch=master
-->

Work done on day one of the hackathon, deploys model onto AzureML to be run from a webservice

## Contents

File/Folder: Description
'azureml': All code is here
	'.vs'
	'.vscode'
	'call.py': Regression model, run to simulate a call to the model
	'call2.py': Resnet50 model, run to simulate a call to the model (CURRENTLY NOT WORKING)
	'deploy.py': Resgression model, deploys the model to AzureML
	'deploy2.py': Resnet50 model, deploys the model to AzureML (CURRENTLY NOT WORKING)
	'deploymentConfig.yml': configuration details for deploying the model to AzureML
	'my_model.h5': Model of Resnet50, may need modification
	'myenv.yml': details about the python environment
	'panda.jpg': image of a panda used for testing
	'score.py': Regression model, handles the actual calculations when called from call.py
	'score2.py': Resnet model, handles the actual classification when called from call2.py
	'sklearn_regression_model.pkl': Regression model
'gitignore': What to ignore at commit time
'CODE_OF_CONDUCT': Code of conduct 
'LICENSE': The license for the files
'README': This README file
'SECURITY': Security information


## Prerequisites

Visual Studio/Visual Studio Code (if you use Visual Studio Code to set up your python environment use ctrl+shift+p, "Python: Select Interpreter")
Anaconda 3.7
Azure Machine Learning workspace
Azure Machine Learning SDK (https://docs.microsoft.com/en-us/python/api/overview/azure/ml/install?view=azure-ml-py)
Docker
Tensorflow
Keras

## Setup

One time run of either deploy.py or deploy2.py depending on which model is being used to deploy the model to the target

## Running the sample

Run call.py or call2.py depending on which model is being used to simulate a call to the AzureML model

## Key concepts

The general idea is that we are deploying a machine learning model to the cloud as a webservice. The regression model was mostly proof of concept and the Resnet50 model is going to be closer to what we will end up using since we will be handling images. 

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
