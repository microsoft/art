# Installing and Running
To run this, you'll need the latest version of Node.js installed.
Open the project root and run `npm install`.

To access the Rijksmuseum API, create a `.env` file in the project root with the following text:

```
REACT_APP_RIJKSMUSEUM_API_KEY={yourapikey}
```

where `{yourapikey}` is replaced by your personal API key. More details about the API are found [here](https://data.rijksmuseum.nl/object-metadata/api/).

Then run `npm start`.

# Design framework
This project uses React Fabric UI.

https://developer.microsoft.com/en-us/fabric#/controls/web/contextualmenu

# Prepareing for Build
Since we use Client Side routing, some hacks need to be introduced to get the site working on github pages.

Step One: Modify Source Code

1. Package.json
    After the "name" line insert the line 
    "homepage":"https://microsoft.github.io/art/",

    This enables the website to know what its base URL is.

2. ResultArtwork.tsx: exploreArtUrlSuffix(), line 42
    change '/' to '/art/'

3. NavBar.tsx, line 23
    change '/' to '/art/'

4. ResultBox.tsx: exploreArtUrlSuffic(), line 36
    change '/' to '/art/'

NOTE: It is not needed to change the URL generation in SubmitControl, since it "pushes" too the end of the homepage URL.

Step Two: Make the Build

run 'npm run build'
This makes a build and populates the build folder.



Step Three: Hack the Build
We follow the instrucions on this page: https://github.com/rafrex/spa-github-pages

1. In the build folder, create a 404.html file, and copy in the contents from the above link.
On line 26, change segmentCount from 0 to 1. This enables the site to handle the /art/ at the end of the homepage URL.

2. In the html, between the noscript and script tags (right after the root div), copy in the script from the above link


Step Four: Deploy the Hacked Build

run 'npm run deploy'
This takes the contents of the build folder, and deploys it to the github pages. It also makes a push to the gh-pages branch of a repo.


# Converting From Deploy to Local

Revert the changes made in the Source Code in Step One of Preparing for Build


# Todo

Add Information at the bottom of the page
- This would be accomplished by adding to the end of the ExplorePage Heirarchy

Carousel Random Picks
- This involves changing the default queries made in ExplorePage

Move Matches Functionality
- This would involve moving the call stack found in an ExplorePage Button to wherever else the functionality needs to be

MultiAcces Queries
- This would probably involve a change of the APi and a change how we handle the data from the Dropdown menus

