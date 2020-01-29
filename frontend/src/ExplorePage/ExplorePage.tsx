// import '../main.scss';
import Jimp from 'jimp';
import { mergeStyles, Stack } from 'office-ui-fabric-react';
import React from 'react';
import { Helmet } from 'react-helmet';
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
    imageDataURI: string;
    galleryItems: ArtObject[],
    conditionals: any
}

const halfStack = mergeStyles({
    width: "50%",
    height: "100%"
})

const rationaleOn = true;


const azureSearchUrl =
    'https://extern-search.search.windows.net/indexes/merged-art-search-3/docs?api-version=2019-05-06';
const apiKey = '0E8FACE23652EB8A6634F02B43D42E55';

const defaultArtObject: ArtObject = new ArtObject("Utagawa Kunimaro (I)", "prints", "japanese", "https://lh3.googleusercontent.com/234_CajwnCl4yeStsWfauXj62B-aCjq6LPpGMJggjZLUnWXvnMQtfsVRld4ywCkltXvv1yFb3JH2Jfy3Iv2Rm5uM-A=s0", "rijks", "https://www.rijksmuseum.nl/en/collection/RP-P-2016-66-7", "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-P-2016-66-7.jpg", "Tiger", "UlAtUC0yMDE2LTY2LTc=");

export class ExplorePage extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props);
        this.state = {
            originalArtwork: defaultArtObject,
            resultArtwork: defaultArtObject,
            bestResultArtwork: defaultArtObject,
            imageDataURI: "",
            galleryItems: [defaultArtObject],
            conditionals: { 'culture': 'italian' }
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
        this.makeAPIquery(this.state.originalArtwork.Thumbnail_Url, clonedConditionals);
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
    updateImageDataURI() {
        // Height of the composite image in pixels
        let imageHeight = 200;

        Jimp.read(this.state.originalArtwork.Thumbnail_Url)
            .then(originalImage => {
                Jimp.read(this.state.resultArtwork.Thumbnail_Url)
                    .then(resultImage => {
                        let originalImageWidth = originalImage.getWidth() * imageHeight / originalImage.getHeight();
                        let resultImageWidth = resultImage.getWidth() * imageHeight / resultImage.getHeight();
                        originalImage.resize(originalImageWidth, imageHeight)
                            .crop(0, 0, originalImageWidth + resultImageWidth, imageHeight)
                            .composite(resultImage.resize(resultImageWidth, imageHeight), originalImageWidth, 0)
                            .getBase64Async(originalImage.getMIME())
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


    /**
     * Queries API with the original artwork with conditional qualities
     * @param originalArtURL the image url of the original artwork
     * @param conditionals the conditional qualities to apply to the query
     */
    makeAPIquery(originalArtURL: string, conditionals: any) {
        // const apiURL = 'http://art-backend.azurewebsites.net/explore';
        // const apiURL = 'https://extern2020apim.azure-api.net/score';
        const apiURL = "https://13.92.189.130/api/v1/service/artgpuservice/score";
        // const apiURL = "https://extern2020apim.azure-api.net/score";
        // let params = '?url=' + originalArtURL + '&numResults=' + '9';
        let params = '?url=' + originalArtURL + '&n=' + '10';

        let fields = Object.keys(conditionals);
        fields.forEach((element: any) => {
            if (conditionals[element] !== "All") {
                params = params + '&' + 'query' + '=' + encodeURIComponent(conditionals[element]);
            }
        });

        //let params = '?id=2738' + '&museum=' + 'rijks' + '&numResults=' + '10'

        console.log("Request: " + apiURL + params);
        const Http = new XMLHttpRequest();
        Http.open('GET', apiURL + params);

        let queryJson = {
            url: originalArtURL,
            culture: "italian",
            classification: "all",
            n: 10
        }

        Http.send();
        Http.send(JSON.stringify(queryJson));
        Http.onreadystatechange = e => {
            if (Http.readyState === 4) {
                try {
                    let response = JSON.parse(Http.responseText);
                    //console.log("response: " + Http.responseText);
                    response = response.results;
                    const filteredResponse = response.filter((artwork:any) => artwork.url != this.state.originalArtwork.Thumbnail_Url)
                    //console.log("filtered: " + filteredResponse);

                    //let ids = response.results.map((result:any) => result.ObjectID);
                    let pieces = filteredResponse;
                    if (pieces.length > 0) {
                        this.setState({ galleryItems: pieces,
                            resultArtwork: pieces[0],
                            bestResultArtwork: pieces[0] });
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

                    self.makeAPIquery(currImgObj.Thumbnail_Url, self.state.conditionals);
                });
        } else {
            let numDefaults = defaultArtwork.length;
            let randIndex = Math.floor(Math.random() * Math.floor(numDefaults));
            console.log("RANDINDEX: "+randIndex);
            let newOriginalArtwork = defaultArtwork[randIndex];
            this.makeAPIquery(newOriginalArtwork.Thumbnail_Url, this.state.conditionals);
            this.setState({ originalArtwork: newOriginalArtwork });
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
                            <OriginalArtwork changeConditional={this.changeConditional} enableRationale={rationaleOn} artwork={this.state.originalArtwork} overlay={OverlayMap[this.state.originalArtwork.id]} handleTrackEvent={this.handleTrackEvent} />
                        </Stack.Item>
                        <Stack.Item className={halfStack} grow={1}>
                            <ResultArtwork artwork={this.state.resultArtwork} enableRationale={rationaleOn} overlay={OverlayMap[this.state.resultArtwork.id]} bestArtwork={this.state.bestResultArtwork} handleTrackEvent={this.handleTrackEvent}/>
                        </Stack.Item>
                    </Stack>
                </HideAt>
                <ShowAt breakpoint="mediumAndBelow">
                    <Stack horizontal horizontalAlign="center" wrap>
                        <Stack.Item grow={1}>
                            <OriginalArtwork changeConditional={this.changeConditional} enableRationale={rationaleOn} artwork={this.state.originalArtwork} overlay={OverlayMap[this.state.originalArtwork.id]} handleTrackEvent={this.handleTrackEvent} />
                        </Stack.Item>
                        <Stack.Item grow={1}>
                            <ResultArtwork artwork={this.state.resultArtwork} enableRationale={rationaleOn} overlay={OverlayMap[this.state.resultArtwork.id]} bestArtwork={this.state.bestResultArtwork} handleTrackEvent={this.handleTrackEvent}/>
                        </Stack.Item>
                    </Stack>
                    <Stack horizontalAlign="center">
                        <Options changeConditional={this.changeConditional} />
                    </Stack>
                </ShowAt>
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
                <div style={{ "width": "100%", "height": "1px", "backgroundColor": "gainsboro", "margin": "15px 0px" }}></div>
                <Stack.Item>
                    <ListCarousel items={this.state.galleryItems} setResultArtwork={this.setResultArtwork} resultArtwork={this.state.resultArtwork} />
                </Stack.Item>
            </Stack>
        )
    }
}

export default ExplorePage
