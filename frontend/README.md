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

# Todo
Collections:
contained in App as state- has updating functions but nowhere to display(shopping cart, change icon)
user input needed when making new collection for the name

Gallery:
performance improvements- large images means slow loading
shimmer loading

Artwork:
direct click on the selected and current should go to museum website

General:
move switch button to the selected Image
put a collectionAdder by the selected image that adds that image
possibly changing name, layout- too much blank space
suggested in meeting to add search
make museum an option?