import React, { Component } from 'react';
import { Stack, DefaultButton} from 'office-ui-fabric-react';
import SelectControl from './SelectControl';
import ResultArt from './ResultArt';
import { Redirect } from 'react-router-dom';
//import { Translation } from 'react-i18next';
//import {AppInsights} from "applicationinsights-js"


const NUM_FROM_EACH_CAT = 2; //Number to choose from each category
const NUM_MAX_RESULTS = 6;

// const buttonStyle = mergeStyles({
//     width: 175,
//     marginLeft: 'auto',
//     marginRight: 'auto',
//     marginTop: 10,
//     marginBottom: 10
// })

interface IState {
    curatedImages: any,
    choiceLists: any, 
    selectedIndex: any,
    selectedImage: any,
    imgObjects: any,
    categorySelected: any,
    redirect: any,
    objIDs: any
};

interface IProps {

};

/**
 * Page for selecting an image to start generating on
 */
class SelectPage extends Component<IProps, IState> {
  constructor(props:any) {
    super(props);
    this.state = {
      curatedImages: {
        Vases: [
          9583,
          9512,
          9408,
          9405,
          9402,
          9397,
          9393,
          2556,
          9396,
          9232,
          9233,
          9249,
          9363,
          9260,
          9252,
          9297,
          9250,
          9299,
        ],
        Armor: [22270, 22408, 22848, 23143, 25114, 34652, 35652, 24937],
        Teapots: [
          8348,
          8354,
          8355,
          8375,
          8385,
          8391,
          8396,
          8401,
          8412,
          8423,
          42323,
          193189,
          194634,
          197523,
          198032,
        ],
        Ewers: [
          201671,
          202194,
          232038,
          324830,
          324917,
          544501,
          751402,
          446900,
          445269,
          200171,
          200117,
          195775,
          194243,
          49208,
          42370,
          447077,
          448260,
          449058,
          460715,
          453457,
          453306,
          452036,
          447072,
          444967,
          444810,
        ],
        Purses: [84595, 116964, 116963, 116944, 116884, 79226, 70467],
        Goblets: [207897, 4081, 4086, 4101, 4102, 4124, 187987, 239826],
      },
      choiceLists: { 0: [], 1: [] }, //I really do not like this, hard coded so theres something to reference
      selectedIndex: 0,
      selectedImage: {
        url: '',
        id: 0,
        key: -1,
      },
      imgObjects: [],
      categorySelected: false,
      redirect: false,
      objIDs: []
    };

    this.changeSelectedImage = this.changeSelectedImage.bind(this);
    this.getImageIDs = this.getImageIDs.bind(this);
    this.clearOldImages = this.clearOldImages.bind(this);
    this.searchArtUrlSuffix = this.searchArtUrlSuffix.bind(this);

    //AppInsights.downloadAndSetup({ instrumentationKey: "7ca0d69b-9656-4f4f-821a-fb1d81338282" });
    //AppInsights.trackPageView("Select Page");
  }

  /**
   * choses N random unique elements from list and returns them in a list
   * @param {any[]} list - list of elements of any type
   * @param {*} n - the number of unqiue elements to choose. N <= list.length
   */
  pickNUniqueFromList(list:any, n:any) {
    if (n > list.length) {
      return 'N IS TOO LARGE';
    }

    let output: any[] = [];
    while (output.length < n) {
      let randIndex = Math.floor(Math.random() * list.length);
      let choice = list[randIndex];
      if (!output.includes(choice)) {
        output.push(choice);
      }
    }
    return output;
  }

  /**
   * Gets the list of object ids to be used on the landing page
   * While doing so, also populates choiceLists with subset lists, each list contianing one ObjID from each category
   * @returns {int[]} - list of object IDs to be displayed
   */
  getLandingPage(input:any) {
    let categories = Object.keys(input);
    let landingPageList: any[] = [];

    let choiceLists:any = {};
    for (let j = 0; j < NUM_FROM_EACH_CAT; j++) {
      choiceLists[j] = [];
    }

    for (let i = 0; i < categories.length; i++) {
      let list = input[categories[i]];
      let choices = this.pickNUniqueFromList(list, NUM_FROM_EACH_CAT);
      landingPageList = landingPageList.concat(choices);

      for (let j = 0; j < NUM_FROM_EACH_CAT; j++) {
        choiceLists[j].push(choices[j]);
      }
    }

    this.setState({
      choiceLists: choiceLists,
      curatedImages: Object.assign({}, input, { All: landingPageList })
    });

    return landingPageList;
  }

  //these are the initial images that are displayed when the page loads
  componentDidMount() {

    const apiURL = 'http://art-backend.azurewebsites.net/curated'
    const Http = new XMLHttpRequest();
    Http.open('GET', apiURL);

    Http.send();
    Http.onreadystatechange = e => {
        if (Http.readyState === 4) {
            try {
                let response = JSON.parse(Http.responseText);
                console.log(response);
                //let ids = response.results.map((result:any) => result.ObjectID);

                //this.setState({"curatedImages": response});
                let landingPageList = this.getLandingPage(response);
                //this.objIDsToImages(landingPageList);
                this.objsToImages(landingPageList);

                
                
            } catch (e) {
            console.log('malformed request:' + Http.responseText);
            }
        }
    }    
  }

  /**
   * Changes the selection of an ID in state
   * @param {int} key
   * @param {int} ID - objID of the art being selected
   */
  changeSelectedImage(img: any, key: any, ID: any) {
    //Unclear if this is a better system or not
    if (ID === this.state.selectedImage.id) {
      this.setState({
        selectedImage: {
          url: '',  
          id: 0,
          key: -1,
        },
      });
    } else {
      this.setState({
        selectedImage: {
          url: img,  
          id: ID,
          key: key,
        },
      });
    }
  }

  /**
   * callback wrapper for the objIDsToImages function
   * @param {int[]} imageIDs - list of object IDs to get the images for
   */
  getImageIDs(imageIDs:any) {
    //this.objIDsToImages(imageIDs);
    this.objsToImages(imageIDs);
  }

  /**
   * Clears the state of objects and the selected category
   */
  clearOldImages() {
    this.setState({
      categorySelected: true,
      imgObjects: [],
    });
  }


  objsToImages(objs:any) {
      let imgObjs = objs.map((obj:any) => ({img: obj["img_url"], id: obj["title"], key: obj["title"]}));
      
      this.setState({
        imgObjects: imgObjs,
      });
  }

  /**
   * loads the images of the specified object IDs from the Met and saves it
   * into this.state.imgObjects
   * @param {Int[]} objIDs - An array of object IDs from the met API to convert to an array of image urls
   */
  objIDsToImages(objIDs:any) {
    const baseURL = 'https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/';

    let imgObjs = objIDs.map((ID:any) => ({ img: baseURL + ID.toString() + '.jpg', id: ID, key: ID }));

    this.setState({
      imgObjects: imgObjs,
    });
  }

  /**
   * Generates a URL suffix to transmit objID's between pages of the website
   * @returns {String} - the URL suffix encoding ObjIDs
   */
  generateArtUrlSuffix() {
    let urlBase = '/map/';
    let idList = [];

    //If a category is selected, then just use the current set of images
    if (this.state.categorySelected) {
      idList = this.state.imgObjects.slice(0, NUM_MAX_RESULTS).map((ob:any) => ob.id);

      //Else, you are in the default landing page and should take the selected image and a choiceList that does not contain the selected image
    } else {
      if (!this.state.choiceLists[0].includes(this.state.selectedImage.id)) {
        idList = [this.state.selectedImage.id].concat(this.state.choiceLists[0]);
      } else {
        idList = [this.state.selectedImage.id].concat(this.state.choiceLists[1]);
      }
      idList = idList.slice(0,NUM_MAX_RESULTS);
    }
    
    // Randomly selects an image if no image is selected from the array of imgObjects and category not selected
    if(this.state.selectedImage.id === 0 && !this.state.categorySelected){
      let imgSet = this.state.imgObjects.slice(0, NUM_MAX_RESULTS).map((ob:any) => ob.id);
      let randomId;

      for(var i = 0 ; i < imgSet.length ; i++){
        let count = 0;
        for(var x = 0 ; x < idList.length ; x++){
          count++;
          if(imgSet[i] === idList[x]){
            break;
          }
        }
        if(count === 6){
          randomId = imgSet[i]

          idList[0] = randomId;
          let url = '?id=' + randomId.toString() + '&ids=[' + idList.toString() + ']';
          url = encodeURIComponent(url);
          return urlBase + url;
        }
      }
    } else {
      let url = '?id=' + this.state.selectedImage.id.toString() + '&ids=[' + idList.toString() + ']';
      url = encodeURIComponent(url);
      return urlBase + url;
    }
  }

  exploreArtUrlSuffix() {
    let urlBase = '/explore/';
    
    // Randomly selects an image if no image is selected from the array of imgObjects and category not selected
    if(this.state.selectedImage.id === 0){
      let imgSet = this.state.imgObjects.slice(0, NUM_MAX_RESULTS).map((ob:any) => ob.id);
      let randomId = imgSet[Math.floor(Math.random()*imgSet.length)];
      

      if (randomId) {
        //let urlURL = '?url=' + thumbnailRoot + randomId.toString() + ".jpg";
        let urlURL = '?url=' + randomId.url;
        let titleURL = '&title=' + "WHOOOOO ARE YOU?";
        let url = encodeURIComponent(urlURL+titleURL);
        return urlBase + url;
      }

    } else {
      //let urlURL = '?url=' + thumbnailRoot + this.state.selectedImage.id.toString() + ".jpg";
      let urlURL = '?url=' + this.state.selectedImage.url;
      let titleURL = '&title=' + "WHOOOOO ARE YOU?";
      let url = encodeURIComponent(urlURL+titleURL);
      return urlBase + url;
    }

    return urlBase;
  }

  jsonToURI(json:any){ return encodeURIComponent(JSON.stringify(json)); }

  searchArtUrlSuffix() {
    let urlBase = '/search/';

    const apiURL = 'https://gen-studio-apim.azure-api.net/met-reverse-search-2/FindSimilarImages/url';
    const key = '?subscription-key=7c02fa70abb8407fa552104e0b460c50&neighbors=20';
    const Http = new XMLHttpRequest();
    const data = new FormData();


    let selID = this.state.selectedImage.url;
    if (this.state.selectedImage.id === 0) {
        let imgSet = this.state.imgObjects.slice(0, NUM_MAX_RESULTS).map((ob:any) => ob.url);
        selID = imgSet[Math.floor(Math.random()*imgSet.length)];
    }

    //const imageURL = 'https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/' + selID.toString() + '.jpg';
    const imageURL = selID;

    data.append('urlInput', imageURL);

    Http.open('POST', apiURL + key);
    //Http.send(data);
    Http.send(JSON.stringify({"urlInput": imageURL}));
    Http.onreadystatechange = e => {
      if (Http.readyState === 4) {
        try {
          let response = JSON.parse(Http.responseText);
          let ids = response.results.map((result:any) => result.ObjectID);
          this.setState({
            "objIDs": ids,
            "redirect": true,
          });

        } catch (e) {
          console.log('malformed request:' + Http.responseText);
        }
      }
    };    
    return urlBase;
  }

  

  render() {

    if (this.state.redirect) {
        let link = `/search/${this.jsonToURI(this.state.objIDs)}`;
        return <Redirect push to={link} />;
    } else {
        return (
            <Stack>
                <Stack.Item className="selectpage__head">
                    <h1 className="claim">{"Select something please"}</h1>
                    <SelectControl
                        sendObjectIds={this.getImageIDs}
                        clearOldImages={this.clearOldImages}
                        curatedImages={this.state.curatedImages}
                    />
                </Stack.Item>
                <Stack.Item>
                    <ResultArt
                        images={this.state.imgObjects}
                        selectedImage={this.state.selectedImage}
                        selectImage={this.changeSelectedImage}
                        categorySelected={this.state.categorySelected}
                    />
                </Stack.Item>
    
                <Stack horizontal horizontalAlign="space-around" className="u-container-centered">
                    <DefaultButton className="button" text="Explore" href={this.exploreArtUrlSuffix()}/>
                    <DefaultButton className="button" text="Search" onClick={this.searchArtUrlSuffix}/>
                </Stack>
            </Stack>
    
        );
    }

  }
}

export default SelectPage;