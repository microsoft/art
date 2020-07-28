# Mosaic

<p align="center">
  <img src="./media/teaser_img.gif" />
</p>

## [Live Demo!](www.aka.ms/mosaic)

## About


Image retrieval systems allow individuals to find images that are semantically similar to a query image. This serves as the backbone of reverse image search engines and many product recommendation engines. Restricting an image retrieval system to particular subsets of images can yield new insights into relationships in the visual world.

We presents a novel method for specializing image retrieval systems called conditional image retrieval. When applied over large art datasets in particular, conditional image retrieval provides visual analogies that bring to light hidden connections among different artists, cultures, and media. Conditional image retrieval systems can efficiently find shared semantics between works of vastly different media and cultural origin. And can also diagnose issues with generative adversarial networks (GANs), algorithms that create novel images from scratch, by identifying where GANs fail to model the true data distribution.

This work was inspired by a special exhibit “Rembrant and Velazquez” in Amsterdam’s Rijksmuseum. This exhibit juxtaposed works from the studios of two great artists of the Netherlands and Spain, Rembrant and Velazquez. These artists did not have a correspondence or meet each other during their lives, but their works shared rich and meaningful themes both symbolically and visually.

 
The exhibit spoke to the commonality of these two artist’s experiences and representations by finding pairs of paintings that speak to the same themes. To me, it hints at a rich, latent structure that underlies visual art across time, origin, and artist. The immediate question was: “How can we find this structure not just between Rembrant and Velazquez, but between any two artists, cultures, or subsets of the collection?” From this idea, we were pushed to develop new algorithms to answer these questions and found that they could apply to other areas and datasets as well.

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
1. Copy `frontend/utils/404.html` file to the `frontend/build`
1. In `frontend/build/index.html`, between the noscript and script tags (right after the root div), copy in the script from `frontend/utils/singe_page_app.txt`
1. run `npm run deploy` to push the build to github pages

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

