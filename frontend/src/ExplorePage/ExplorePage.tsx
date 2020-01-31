// import '../main.scss';
import Jimp from 'jimp';
import { mergeStyles, Stack, Separator } from 'office-ui-fabric-react';
import React from 'react';
import { FacebookIcon, FacebookShareButton, LinkedinIcon, LinkedinShareButton, TwitterIcon, TwitterShareButton } from 'react-share';
import { HideAt, ShowAt } from 'react-with-breakpoints';
import { appInsights } from '../AppInsights';
import ArtObject from "../ArtObject";
import bannerImage from "./banner.jpg";
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
    cultureItems: ArtObject[],
    mediumItems: ArtObject[],
    conditionals: any,
    shareLink: string,
    canRationale: boolean,
    rationaleOn: boolean
}

const halfStack = mergeStyles({
    width: "50%",
    height: "100%"
})

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
            cultureItems: [defaultArtObject],
            mediumItems: [defaultArtObject],
            conditionals: { 'culture': '', 'medium': '' },
            shareLink: "",
            canRationale: false,
            rationaleOn: false,
        }
        this.setResultArtwork = this.setResultArtwork.bind(this);
        this.changeConditional = this.changeConditional.bind(this);
        this.handleTrackEvent = this.handleTrackEvent.bind(this);
        this.scrollToReference = this.scrollToReference.bind(this);
        this.toggleRationale = this.toggleRationale.bind(this);
    }

    // Reference for scrolling to the start of the compare block
    startRef = React.createRef<HTMLDivElement>();
    scrollToReference(reference: any): void {
        window.scrollTo({ top: reference.current.offsetTop, left: 0, behavior: "smooth" });
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
     * @param category the category/axis to filter on (Culture, Medium, etc); currently does not matter for the API (only option is used)
     * @param option the new filter option to use (French, Sculptures, etc)
     */
    changeConditional(category: any, option: any): void {
        let clonedConditionals = { ...this.state.conditionals };
        clonedConditionals[category] = option;
        this.setState({ "conditionals": clonedConditionals });
        this.makeAPIquery(this.state.originalArtwork, category, option);
    }

    toggleRationale() {
        let newState = !this.state.rationaleOn;
        this.setState({ rationaleOn: newState });
    }

    /**
     * Updates the result artwork
     * @param newResultArtwork the artwork to set as the new result
     */
    setResultArtwork(newResultArtwork: ArtObject, originalArtwork?: ArtObject): void {
        this.setState({ resultArtwork: newResultArtwork }, this.updateImageDataURI);
        originalArtwork = originalArtwork ? originalArtwork : this.state.originalArtwork;
        console.log("result: " + newResultArtwork);
        console.log("original: " + originalArtwork);

        if (OverlayMap[newResultArtwork.id] || OverlayMap[originalArtwork.id]) {
            console.log("TURNING ON RATIONALE");
            this.setState({ canRationale: true });
        } else {
            console.log("TURNING OFF RATIONALE");
            this.setState({ canRationale: false });
        }
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
    updateImageDataURI(originalArtwork?: ArtObject, resultArtwork?: ArtObject) {
        // Height of the composite image in pixels
        let imageHeight = 400;

        let originalURL = originalArtwork ? originalArtwork.Thumbnail_Url : this.state.originalArtwork.Thumbnail_Url;
        let resultURL = resultArtwork ? resultArtwork.Thumbnail_Url : this.state.resultArtwork.Thumbnail_Url;


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

                                let requestOptions: any = {
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
                                        console.log(shareURL + params)
                                        this.setState({ shareLink: shareURL + params });
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
     * @param category the category/axis to filter on (Culture, Medium, etc)
     * @param option the new filter option to use (French, Sculptures, etc)
     */
    //makeAPIquery(originalArtURL: string, conditionals: any) {
    makeAPIquery(originalArtwork: ArtObject, category: "all" | "culture" | "medium", option: string) {
        let originalArtURL = originalArtwork.Thumbnail_Url;
        const apiURL = "https://extern2020apim.azure-api.net/cknn/";
        let params = '?url=' + originalArtURL + '&n=' + '10';
        const Http = new XMLHttpRequest();
        Http.open('POST', apiURL);

        console.log("option: " + option + category);

        let queryJson = option === '' ?
            { url: originalArtURL, n: 10 }
            : { url: originalArtURL, n: 10, query: option };

        //Http.send();
        Http.send(JSON.stringify(queryJson));
        Http.onreadystatechange = e => {
            if (Http.readyState === 4) {
                try {
                    let response = JSON.parse(Http.responseText);
                    response = response.results;
                    const mappedData = response.map((pair: any) => pair[0]);
                    const filteredResponse = mappedData.filter((artwork: any) => artwork.Thumbnail_Url !== originalArtURL);

                    //let ids = response.results.map((result:any) => result.ObjectID);
                    let pieces = filteredResponse;
                    if (pieces.length > 0) {
                        if (category === "culture") {
                            this.setState({
                                cultureItems: pieces,
                                resultArtwork: pieces[0],
                                bestResultArtwork: pieces[0]
                            });
                        }
                        else if (category === "medium") {
                            this.setState({
                                mediumItems: pieces,
                                resultArtwork: pieces[0],
                                bestResultArtwork: pieces[0]
                            });
                        }
                        else {
                            this.setState({
                                cultureItems: pieces,
                                mediumItems: pieces,
                                resultArtwork: pieces[0],
                                bestResultArtwork: pieces[0]
                            });
                        }
                        this.updateImageDataURI(originalArtwork, pieces[0]);
                        this.setResultArtwork(pieces[0], originalArtwork);
                    }


                } catch (e) {
                    console.log('malformed request:' + Http.responseText + category);
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

                    self.makeAPIquery(currImgObj, "all", self.state.conditionals["culture"]);
                });
        } else {
            let numDefaults = defaultArtwork.length;
            let randIndex = Math.floor(Math.random() * Math.floor(numDefaults));
            console.log("RANDINDEX: " + randIndex);
            let newOriginalArtwork = defaultArtwork[randIndex];
            this.makeAPIquery(newOriginalArtwork, "all", this.state.conditionals["culture"]);
            this.setState({ originalArtwork: newOriginalArtwork });
        }

    }

    render() {
        let rationaleButtonText = this.state.rationaleOn ? "Hide Rationale" : "Show Rationale";
        return (
            <div style={{ position: "relative", top: "-74px" }}>
                <HideAt breakpoint="mediumAndBelow">
                    <div className="explore__background-banner">
                        <img className="explore__parallax" src={bannerImage} />
                        <div className="explore__banner-text">Find the building blocks of art that have transcended culture, medium, and time.</div>
                        <button onClick={() => this.scrollToReference(this.startRef)} className="explore__get-started button" >GET STARTED</button>
                    </div>
                    <div ref={this.startRef} className="explore__compare-block explore__solid">
                        <Stack horizontal>
                            <Stack.Item className={halfStack} grow={1}>
                                <OriginalArtwork changeConditional={this.changeConditional} overlayOn={this.state.rationaleOn} artwork={this.state.originalArtwork} overlay={OverlayMap[this.state.originalArtwork.id]} handleTrackEvent={this.handleTrackEvent} />
                            </Stack.Item>
                            <Stack.Item className={halfStack} grow={1}>
                                <ResultArtwork artwork={this.state.resultArtwork} overlayOn={this.state.rationaleOn} overlay={OverlayMap[this.state.resultArtwork.id]} bestArtwork={this.state.bestResultArtwork} handleTrackEvent={this.handleTrackEvent} />
                            </Stack.Item>
                        </Stack>
                    </div>
                </HideAt>
                <ShowAt breakpoint="mediumAndBelow">
                    <div className="explore__compare-block explore__solid">
                        <Stack horizontal horizontalAlign="center" wrap>
                            <Stack.Item grow={1}>
                                <OriginalArtwork changeConditional={this.changeConditional} overlayOn={this.state.rationaleOn} artwork={this.state.originalArtwork} overlay={OverlayMap[this.state.originalArtwork.id]} handleTrackEvent={this.handleTrackEvent} />
                            </Stack.Item>
                            <Stack.Item grow={1}>
                                <ResultArtwork artwork={this.state.resultArtwork} overlayOn={this.state.rationaleOn} overlay={OverlayMap[this.state.resultArtwork.id]} bestArtwork={this.state.bestResultArtwork} handleTrackEvent={this.handleTrackEvent} />
                            </Stack.Item>
                        </Stack>
                    </div>
                </ShowAt>
                <div className="explore__solid">
                    <Stack horizontalAlign="center">
                        <button className="explore__buttons button" disabled={!this.state.canRationale} onClick={this.toggleRationale}>{rationaleButtonText}</button>
                        <Stack horizontal horizontalAlign="center">
                            <div onClick={() => this.handleTrackEvent("Share", { "Network": "Facebook" })}>
                                <FacebookShareButton className="explore__share-button" url={this.state.shareLink}>
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
                    </Stack>
                    {/* <div style={{ "width": "100%", "height": "1px", "backgroundColor": "gainsboro", "margin": "10px 0px" }}></div> */}
                    <Separator/>
                    <Stack horizontal horizontalAlign="space-around" verticalAlign="center" wrap>
                        <Options category="culture" changeConditional={this.changeConditional} />
                        <ListCarousel items={this.state.cultureItems} setResultArtwork={this.setResultArtwork} resultArtwork={this.state.resultArtwork} />
                    </Stack>
                    {/* <div style={{ "width": "100%", "height": "1px", "backgroundColor": "gainsboro", "margin": "10px 0px" }}></div> */}
                    <Separator/>
                    <Stack horizontal horizontalAlign="space-around" verticalAlign="center" wrap>
                        <Options category="medium" changeConditional={this.changeConditional} />
                        <ListCarousel items={this.state.mediumItems} setResultArtwork={this.setResultArtwork} resultArtwork={this.state.resultArtwork} />
                    </Stack>
                </div>
            </div>
        )
    }
}

export default ExplorePage
