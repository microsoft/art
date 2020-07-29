
# Mosaic Developer Guide

## Building from Scratch

### Backend

To deploy your own conditional image retrieval search index please follow these steps

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

To build a copy of the mosaic website locally please use the following. Note that the introductory animations were made and deployed using a different framework. 

#### Development 

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

#### Deployment

1. run `npm run build` to create a optimized build
1. Copy `frontend/utils/404.html` file to the `frontend/build` directory
1. In `frontend/build/index.html`, between the noscript and script tags (right after the root div), copy in the script from `frontend/utils/singe_page_app.txt`
1. run `npm run deploy` to push the build to github pages