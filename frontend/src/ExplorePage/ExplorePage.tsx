// import '../main.scss';
import React from 'react';
import { Stack, Separator, mergeStyles } from 'office-ui-fabric-react';
import SelectedArtwork from './SelectedArtwork';
import ResultArtwork from './ResultArtwork';
import Options from './Options';
import GalleryItem from './GalleryItem';
import ListGrid from './ListGrid';
import { HideAt, ShowAt } from 'react-with-breakpoints';
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon, LinkedinShareButton, LinkedinIcon } from 'react-share';
import { Helmet } from 'react-helmet';
import Jimp from 'jimp';
import { appInsights } from '../AppInsights';

interface IProps {
    match: any
};

interface IState {
    current: any,
    selected: any,
    bestItem: any,
    imageDataURI: string;
    galleryItems: any[],
    conditionals: any,
    url: any
}

const halfStack = mergeStyles({
    width: "50%",
    height: "100%"
})



const azureSearchUrl = 
'https://extern-search.search.windows.net/indexes/merged-art-search-3/docs?api-version=2019-05-06';
const apiKey = '0E8FACE23652EB8A6634F02B43D42E55';

export class ExplorePage extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props);
        this.state = {
            current: {},
            selected: {},
            bestItem: {},
            imageDataURI: "",
            galleryItems: [],
            conditionals: { 'Culture': 'All', 'Medium': "All" },
            url: ''
        }
        this.setSelected = this.setSelected.bind(this);
        this.changeConditional = this.changeConditional.bind(this);
        this.handleTrackEvent = this.handleTrackEvent.bind(this);
    }

    setCurrent(newCurrent: GalleryItem): void {
        this.setState({ "current": newCurrent });
    }

    changeConditional(thing: any, thing2?: any): void {
        let clonedConditionals = { ...this.state.conditionals };
        clonedConditionals[thing] = thing2['text'];
        console.log(clonedConditionals);
        this.setState({ "conditionals": clonedConditionals });
        this.makeAPIquery(this.state.current.url, clonedConditionals);
    }

    setSelected(newSelected: GalleryItem): void {
        this.setState({ "selected": newSelected }, this.updateImageDataURI);
    }

    setGalleryItems(newItems: GalleryItem[]): void {
        this.setState({ "galleryItems": newItems });
    }

    updateImageDataURI() {
        let imageHeight = 200;

        Jimp.read(this.state.selected.url)
            .then(resultImage => {
                Jimp.read(this.state.current.url)
                    .then(currentImage => {
                        let resultImageWidth = resultImage.getWidth() * imageHeight / resultImage.getHeight();
                        let currentImageWidth = currentImage.getWidth() * imageHeight / currentImage.getHeight();
                        resultImage.resize(resultImageWidth, imageHeight)
                            .crop(0, 0, resultImageWidth + currentImageWidth, imageHeight)
                            .composite(currentImage.resize(currentImageWidth, imageHeight), resultImageWidth, 0)
                            .getBase64Async(resultImage.getMIME())

                            // resultImage.resize(200, 200).crop(0,0,400,200).composite(currentImage.resize(200, 200), 200, 0).getBase64Async(resultImage.getMIME())
                            .then(uri => {
                                console.log(uri)
                                this.setState({ imageDataURI: uri })
                            })
                    })
            })
    }

    /**
     * Handles event tracking for interactions
     * @param eventName Name of the event to send to appInsights
     * @param properties Custom properties to include in the event data
     */
    async handleTrackEvent(eventName: string, properties: Object) {
        console.log("Tracked " + eventName);
        appInsights.trackEvent({ name: eventName, properties: properties });
    }


    makeAPIquery(selectedArtURL: any, conditionals: any) {
        // const apiURL = 'http://art-backend.azurewebsites.net/explore';
        const apiURL = 'https://extern2020apim.azure-api.net/explore';
        let params = '?url=' + selectedArtURL + '&numResults=' + '9';

        let fields = Object.keys(conditionals);
        fields.forEach((element: any) => {
            if (conditionals[element] !== "All") {
                params = params + '&' + element.toLowerCase() + '=' + conditionals[element];
            }
        });

        //let params = '?id=2738' + '&museum=' + 'rijks' + '&numResults=' + '10'

        const Http = new XMLHttpRequest();
        Http.open('GET', apiURL + params);

        Http.send();
        Http.onreadystatechange = e => {
            if (Http.readyState === 4) {
                try {
                    let response = JSON.parse(Http.responseText);
                    //let ids = response.results.map((result:any) => result.ObjectID);
                    let pieces = response;
                    this.setState({ "galleryItems": pieces, "selected": pieces[0], "bestItem": pieces[0] });



                } catch (e) {
                    console.log('malformed request:' + Http.responseText);
                }
            }
        }
    }

    componentDidMount() {
        //Decode the url data
        //let url = this.props.match.params.data;
        const url = decodeURIComponent( this.props.match.params.data); // The IDs of the images found by NN
        console.log(url);
        if (url) {

            let realID = null;
            let realMuseum = null;
            if (url != null) {
              realID = url.split("&")[0].slice(4);
              realMuseum = url.split("&")[1];
              console.log(realMuseum);
              if (realMuseum) {
                realMuseum = realMuseum.slice(7);
              }
            }

            let query="&search="+realID+"&filter="+realMuseum;
            console.log(query);
            let self = this;
            //Make query
            fetch(azureSearchUrl + query, { headers: {"Content-Type": "application/json", 'api-key': apiKey,  } })
            .then(function(response) {            
              return response.json();
            })
            .then(function(responseJson) {
                console.log(responseJson.value[0]);
                let currImgObj = responseJson.value[0];
                self.setState({current: responseJson.value[0]});

                self.makeAPIquery(currImgObj.Thumbnail_Url, self.state.conditionals);              
            });
        } else {
            let selectedArt = {
                "@search.score": 1.7071549,
                "id": "UlAtUC0yMDE2LTY2LTc=",
                "Title": "Tiger",
                "Artist": "Utagawa Kunimaro (I)",
                "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-P-2016-66-7.jpg",
                "Image_Url": "https://lh3.googleusercontent.com/234_CajwnCl4yeStsWfauXj62B-aCjq6LPpGMJggjZLUnWXvnMQtfsVRld4ywCkltXvv1yFb3JH2Jfy3Iv2Rm5uM-A=s0",
                "Culture": "japanese",
                "Classification": "prints",
                "Museum_Page": "https://www.rijksmuseum.nl/en/collection/RP-P-2016-66-7",
                "Museum": "rijks",
                "requestId": null,
                "categories": [],
                "adult": null,
                "tags": [],
                "description": null,
                "metadata": null,
                "faces": [],
                "color": null,
                "imageType": null,
                "brands": [],
                "objects": []
            }

            this.makeAPIquery(selectedArt.Thumbnail_Url, this.state.conditionals);


            this.setState({ current: selectedArt});
        }

    }

    render() {
        return (
            <Stack>
                <Helmet>
                    <meta property="og:image" content={this.state.imageDataURI} />
                </Helmet>
                <HideAt breakpoint="mediumAndBelow">
                    <Stack horizontal>
                        <Stack.Item className={halfStack} grow={1}>
                            <SelectedArtwork item={this.state.current} handleTrackEvent={this.handleTrackEvent} />
                        </Stack.Item>
                        <Stack.Item className={halfStack} grow={1}>
                            <ResultArtwork item={this.state.selected} bestItem={this.state.bestItem} handleTrackEvent={this.handleTrackEvent}/>
                        </Stack.Item>
                    </Stack>
                </HideAt>
                <ShowAt breakpoint="mediumAndBelow">
                    <Stack horizontal horizontalAlign="space-around" wrap>
                        <Stack.Item grow={1}>
                            <SelectedArtwork item={this.state.current} handleTrackEvent={this.handleTrackEvent} />
                        </Stack.Item>
                        <Stack.Item grow={1}>
                            <ResultArtwork item={this.state.selected} bestItem={this.state.bestItem} handleTrackEvent={this.handleTrackEvent}/>
                        </Stack.Item>
                    </Stack>
                    <Stack horizontal horizontalAlign="center">
                        <div onClick={() => this.handleTrackEvent("Share", { "Network": "Facebook" })}>
                            <FacebookShareButton className="explore__share-button" quote="Check out Mosaic!" url={window.location.href}>
                                <FacebookIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                            </FacebookShareButton>
                        </div>
                        <div onClick={() => this.handleTrackEvent("Share", { "Network": "Twitter" })}>
                            <TwitterShareButton className="explore__share-button" title="Check out Mosaic!" url={window.location.href}>
                                <TwitterIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                            </TwitterShareButton>
                        </div>
                        <div onClick={() => this.handleTrackEvent("Share", { "Network": "Linkedin" })}>
                            <LinkedinShareButton className="explore__share-button" url={window.location.href}>
                                <LinkedinIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                            </LinkedinShareButton>
                        </div>
                    </Stack>
                </ShowAt>
                <div style={{ "width": "100%", "height": "1px", "backgroundColor": "gainsboro", "margin": "15px 0px" }}></div>
                <Stack.Item>
                    <Options callback={this.changeConditional} />
                </Stack.Item>
                <Stack.Item>
                    <ListGrid items={this.state.galleryItems} setSelected={this.setSelected} selected={this.state.selected} />
                </Stack.Item>
            </Stack>
        )
    }
}

export default ExplorePage
