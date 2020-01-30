// import '../main.scss';
import Jimp from 'jimp';
import { mergeStyles, Stack } from 'office-ui-fabric-react';
import React from 'react';
import { FacebookIcon, FacebookShareButton, LinkedinIcon, LinkedinShareButton, TwitterIcon, TwitterShareButton } from 'react-share';
import { HideAt, ShowAt } from 'react-with-breakpoints';
import { appInsights } from '../AppInsights';
import ArtObject from "../ArtObject";
import { defaultArtwork } from './DefaultArtwork';
import ListCarousel from './ListCarousel';
import Options from './Options';
import OriginalArtwork from './OriginalArtwork';
import OverlayMap from './OverlayMap';
import ResultArtwork from './ResultArtwork';

interface IProps {
    match: any
};

interface IState {
    originalArtwork: ArtObject,
    resultArtwork: ArtObject,
    bestResultArtwork: ArtObject,
    imageDataURI: string,
    galleryItems: ArtObject[],
    conditionals: any,
    shareLink: string
}

const halfStack = mergeStyles({
    width: "50%",
    height: "100%"
})

const rationaleOn = true;


const azureSearchUrl =
    'https://extern-search.search.windows.net/indexes/merged-art-search-3/docs?api-version=2019-05-06';
const apiKey = '0E8FACE23652EB8A6634F02B43D42E55';

const defaultArtObject: ArtObject = new ArtObject("", "", "", "", "", "", "", "", "");

export class ExplorePage extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props);
        this.state = {
            originalArtwork: defaultArtObject,
            resultArtwork: defaultArtObject,
            bestResultArtwork: defaultArtObject,
            imageDataURI: "",
            galleryItems: [defaultArtObject],
            conditionals: { 'culture': '' },
            shareLink: ""
        }
        this.setResultArtwork = this.setResultArtwork.bind(this);
        this.changeConditional = this.changeConditional.bind(this);
        this.handleTrackEvent = this.handleTrackEvent.bind(this);
    }

    /**
     * Updates the current original artwork
     * @param newOriginalArtwork the new artwork to requery on
     */
    setOriginalArtwork(newOriginalArtwork: ArtObject): void {
        this.setState({ originalArtwork: newOriginalArtwork });
    }

    /**
     * Updates the conditional qualities to apply to the exploration
     * @param category the category/axis to filter on (Culture, Medium, etc)
     * @param option the new filter option to use (French, Sculptures, etc)
     */
    changeConditional(category: any, option?: any): void {
        let clonedConditionals = { ...this.state.conditionals };
        clonedConditionals[category] = option;
        this.setState({ "conditionals": clonedConditionals });
        this.makeAPIquery(this.state.originalArtwork.Thumbnail_Url, option);
    }

    /**
     * Updates the result artwork
     * @param newResultArtwork the artwork to set as the new result
     */
    setResultArtwork(newResultArtwork: ArtObject): void {
        this.setState({ resultArtwork: newResultArtwork }, this.updateImageDataURI);
    }

    /**
     * Updates the artworks in the gallery carousel
     * @param newItems the new artworks to display in the gallery carousel
     */
    setGalleryItems(newItems: ArtObject[]): void {
        this.setState({ "galleryItems": newItems });
    }

    /**
     * Updates the data uri that encodes a side-by-side composite image of the orignal and result artworks for sharing
     */
    updateImageDataURI(originalURL? :string, resultURL? :any) {
        // Height of the composite image in pixels
        let imageHeight = 650;

        originalURL = originalURL ? originalURL : this.state.originalArtwork.Thumbnail_Url;
        resultURL = resultURL ? resultURL : this.state.resultArtwork.Thumbnail_Url;


        Jimp.read(originalURL)
            .then(originalImage => {
                Jimp.read(resultURL)
                    .then(resultImage => {
                        let originalImageWidth = originalImage.getWidth() * imageHeight / originalImage.getHeight();
                        let resultImageWidth = resultImage.getWidth() * imageHeight / resultImage.getHeight();
                        originalImage.resize(originalImageWidth, imageHeight)
                            .crop(0, 0, originalImageWidth + resultImageWidth, imageHeight)
                            .composite(resultImage.resize(resultImageWidth, imageHeight), originalImageWidth, 0)
                            .getBase64Async(Jimp.MIME_PNG)
                            .then(uri => {
                                
                                let myHeaders = new Headers();
                                myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                                let urlencoded = new URLSearchParams();
                                urlencoded.append("image", encodeURI(uri));
                                
                                let requestOptions:any = {
                                    method: 'POST',
                                    headers: myHeaders,
                                    body: urlencoded,
                                    redirect: 'follow'
                                };

                                let filename = this.state.originalArtwork.id + "_" + this.state.resultArtwork.id + ".jpg";
                                fetch("https://mosaicart.azurewebsites.net/upload?filename=" + encodeURIComponent(filename),
                                requestOptions)
                                    .then(response => response.json())
                                    .then(result => {
                                        // let sharLink = "https://art-backend.azurewebsites.net/share?image_url={a}&redirect_url={b}&title={c}&description={d}"
                                        let shareURL = "https://mosaicart.azurewebsites.net/share";
                                        let params = "?" + "image_url=" + result.img_url +
                                                           "&redirect_url=" + window.location.href +
                                                           "&title=" + "Mosaic" +
                                                           "&description=" + encodeURIComponent(this.state.originalArtwork.Title + " and " + this.state.resultArtwork.Title) +
                                                           "&width=" + Math.round(originalImageWidth + resultImageWidth) + 
                                                           "&height=" + imageHeight;
                                        console.log(shareURL+params)
                                        this.setState({shareLink: shareURL+params});
                                    })
                                    .catch(error => console.log('error', error));
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


    /**
     * Queries API with the original artwork with conditional qualities
     * @param originalArtURL the image url of the original artwork
     * @param conditionals the conditional qualities to apply to the query
     */
    //makeAPIquery(originalArtURL: string, conditionals: any) {
    makeAPIquery(originalArtURL: string, option: string) {
        const apiURL = "https://extern2020apim.azure-api.net/cknn/";
        let params = '?url=' + originalArtURL + '&n=' + '10';
        const Http = new XMLHttpRequest();
        Http.open('POST',apiURL);

        console.log("option: "+option);

        let queryJson = option === '' ? 
                            { url: originalArtURL, n: 10} 
                            : { url: originalArtURL, n: 10, query: option}; 

        //Http.send();
        Http.send(JSON.stringify(queryJson));
        Http.onreadystatechange = e => {
            if (Http.readyState === 4) {
                try {
                    let response = JSON.parse(Http.responseText);
                    response = response.results;
                    const mappedData = response.map((pair:any) => pair[0]);
                    const filteredResponse = mappedData.filter((artwork: any) => artwork.Thumbnail_Url !== originalArtURL);

                    //let ids = response.results.map((result:any) => result.ObjectID);
                    let pieces = filteredResponse;
                    if (pieces.length > 0) {
                        this.setState({
                            galleryItems: pieces,
                            resultArtwork: pieces[0],
                            bestResultArtwork: pieces[0]
                        });
                        this.updateImageDataURI(originalArtURL, pieces[0].Thumbnail_Url);
                    }


                } catch (e) {
                    console.log('malformed request:' + Http.responseText);
                }
            }
        }
    }

    componentDidMount() {
        //Decode the url data
        if (this.props.match.params.data) {
            const url = decodeURIComponent(this.props.match.params.data);
            console.log(url);

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

            let query = "&search=" + realID + "&filter=" + realMuseum;
            console.log(query);
            let self = this;
            //Make query
            fetch(azureSearchUrl + query, { headers: { "Content-Type": "application/json", 'api-key': apiKey, } })
                .then(function (response) {
                    return response.json();
                })
                .then(function (responseJson) {
                    console.log(responseJson.value[0]);
                    let currImgObj = responseJson.value[0];
                    self.setState({ originalArtwork: responseJson.value[0] });

                    self.makeAPIquery(currImgObj.Thumbnail_Url, self.state.conditionals["culture"]);
                });
        } else {
            let numDefaults = defaultArtwork.length;
            let randIndex = Math.floor(Math.random() * Math.floor(numDefaults));
            console.log("RANDINDEX: " + randIndex);
            let newOriginalArtwork = defaultArtwork[randIndex];
            this.makeAPIquery(newOriginalArtwork.Thumbnail_Url, this.state.conditionals["culture"]);
            this.setState({ originalArtwork: newOriginalArtwork });
        }

    }

    render() {
        return (
            <div style={{position: "relative", top: "-74px"}}>
                <HideAt breakpoint="mediumAndBelow">
                    <div className="explore__background-banner">
                        <img className="explore__parallax" src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Boston_Twilight_Panorama_3.jpg/1920px-Boston_Twilight_Panorama_3.jpg"/>
                        <button className="explore__get-started button">GET STARTED</button>
                    </div>
                    <div style={{backgroundColor: "white"}}>
                    <Stack horizontal>
                        <Stack.Item className={halfStack} grow={1}>
                            <OriginalArtwork changeConditional={this.changeConditional} enableRationale={rationaleOn} artwork={this.state.originalArtwork} overlay={OverlayMap[this.state.originalArtwork.id]} handleTrackEvent={this.handleTrackEvent} />
                        </Stack.Item>
                        <Stack.Item className={halfStack} grow={1}>
                            <ResultArtwork artwork={this.state.resultArtwork} enableRationale={rationaleOn} overlay={OverlayMap[this.state.resultArtwork.id]} bestArtwork={this.state.bestResultArtwork} handleTrackEvent={this.handleTrackEvent} />
                        </Stack.Item>
                    </Stack>
                    </div>
                </HideAt>
                <ShowAt breakpoint="mediumAndBelow">
                    <Stack horizontal horizontalAlign="center" wrap>
                        <Stack.Item grow={1}>
                            <OriginalArtwork changeConditional={this.changeConditional} enableRationale={rationaleOn} artwork={this.state.originalArtwork} overlay={OverlayMap[this.state.originalArtwork.id]} handleTrackEvent={this.handleTrackEvent} />
                        </Stack.Item>
                        <Stack.Item grow={1}>
                            <ResultArtwork artwork={this.state.resultArtwork} enableRationale={rationaleOn} overlay={OverlayMap[this.state.resultArtwork.id]} bestArtwork={this.state.bestResultArtwork} handleTrackEvent={this.handleTrackEvent} />
                        </Stack.Item>
                    </Stack>
                    <Stack horizontalAlign="center">
                        <Options changeConditional={this.changeConditional} />
                    </Stack>
                </ShowAt>
                <Stack horizontal horizontalAlign="center">
                    <div onClick={() => this.handleTrackEvent("Share", { "Network": "Facebook" })}>
                        <FacebookShareButton className="explore__share-button"  url={this.state.shareLink}>
                            <FacebookIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                        </FacebookShareButton>
                    </div>
                    <div onClick={() => this.handleTrackEvent("Share", { "Network": "Twitter" })}>
                        <TwitterShareButton className="explore__share-button" title="Check out my Mosaic!" url={this.state.shareLink}>
                            <TwitterIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                        </TwitterShareButton>
                    </div>
                    <div onClick={() => this.handleTrackEvent("Share", { "Network": "Linkedin" })}>
                        <LinkedinShareButton className="explore__share-button" url={this.state.shareLink}>
                            <LinkedinIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                        </LinkedinShareButton>
                    </div>
                </Stack>
                <div style={{ "width": "100%", "height": "1px", "backgroundColor": "gainsboro", "margin": "15px 0px" }}></div>
                <Stack.Item>
                    <ListCarousel items={this.state.galleryItems} setResultArtwork={this.setResultArtwork} resultArtwork={this.state.resultArtwork} />
                </Stack.Item>
            </div>
        )
    }
}

export default ExplorePage
