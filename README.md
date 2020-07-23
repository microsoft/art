# Mosaic

## About

## Architecture

## Paper

## Building from Scratch

### Backend

1. Download Image Metadata:
    ```bash
    wget https://mmlsparkdemo.blob.core.windows.net/cknn/metadata.json?sv=2019-02-02&st=2020-07-23T02%3A22%3A30Z&se=2023-07-24T02%3A22%3A00Z&sr=b&sp=r&sig=hDnGw9y%2BO5XlggL6br%2FPzSKmpAdUZ%2F1LJKVkcmbVmCE%3D
    ```
1. Download Images:
    ```bash
   cd data_prep
   python download_images.py 
   ```  
1. Featurize and perform Conditional Image Retrieval on every image
   ```bash
   cd data_prep
   python featurize_and_match.py 
   ```
1. Write enriched information to an Azure Search Index. 

    More detailed code coming soon, Follow [the closely related guide](
https://docs.microsoft.com/en-us/azure/cognitive-services/big-data/recipes/art-explorer) for a similiar example.

### Frontend

1. Install `npm` if you dont already have it. You can find instructions at [https://nodejs.org/](https://nodejs.org/).
1. Install dependencies:
	```bash
	cd frontend
	npm install
	```
1. Start the development server:
	```bash
	npm start
	```
1. Navigate to [http://localhost:3000/art](http://localhost:3000/art) to explore the local website.


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

