// import '../main.scss';
import Jimp from 'jimp';
import { mergeStyles, Separator, Stack } from 'office-ui-fabric-react';
import React from 'react';
import { FacebookIcon, FacebookShareButton, LinkedinIcon, LinkedinShareButton, TwitterIcon, TwitterShareButton } from 'react-share';
import { HideAt, ShowAt } from 'react-with-breakpoints';
import { appInsights } from '../Shared/AppInsights';
import { ArtObject, ArtMatch, loadingMatch, loadingArtwork } from "../Shared/ArtSchemas";
import bannerImage from "../images/banner.jpg";
import { defaultIds } from './DefaultArtwork';
import ListCarousel from './ListCarousel';
import Options from './Options';
import QueryArtwork from './OriginalArtwork';
import ResultArtwork from './ResultArtwork';
import SubmitControl from './SubmitControl';
import { nMatches } from '../Shared/SearchTools';
import { lookupWithMatches, lookup, cultures, media } from '../Shared/SearchTools'
import NavBar from '../Shared/NavBar';

interface IProps {
    match: any
};

interface IState {
    queryArtwork: ArtObject,
    chosenResultArtwork: ArtObject,
    imageDataURI: string | null,
    cultureItems: ArtMatch[],
    mediumItems: ArtMatch[],
    cultureFilter: string,
    mediumFilter: string,
    shareLink: string | null,
}

const halfStack = mergeStyles({
    width: "50%",
    height: "100%"
})

const startingCultures = ["american", "asian", "ancient_asian", "greek", "italian", "african", "chinese", "roman", "egyptian"]
const startingMedia = ["paintings", "ceramics", "stone", "sculptures", "prints", "glass", "textiles", "photographs", "drawings"]

/**
 * The Page thats shown when the user first lands onto the website
 */
export class ExplorePage extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props);
        this.state = {
            queryArtwork: loadingArtwork,
            chosenResultArtwork: loadingArtwork,
            imageDataURI: null,
            cultureItems: Array(nMatches).fill(loadingMatch),
            mediumItems: Array(nMatches).fill(loadingMatch),
            cultureFilter: startingCultures[Math.floor(Math.random() * Math.floor(startingCultures.length))],
            mediumFilter: startingMedia[Math.floor(Math.random() * Math.floor(startingMedia.length))],
            shareLink: null
        }

        // Bind everything for children
        this.setResultArtwork = this.setResultArtwork.bind(this);
        this.handleTrackEvent = this.handleTrackEvent.bind(this);
        this.scrollToReference = this.scrollToReference.bind(this);
        this.changeCulture = this.changeCulture.bind(this);
        this.changeMedium = this.changeMedium.bind(this);

    }

    // Reference for scrolling to the start of the compare block
    startRef = React.createRef<HTMLDivElement>();

    /**
     * Executes a smooth scroll effect to a specified reference
     * @param reference the reference object to scroll to
     */
    scrollToReference(reference: any): void {
        window.scrollTo({ top: reference.current.offsetTop, left: 0, behavior: "smooth" });
    }

    changeCulture(option: string): void {
        this.setState({ cultureFilter: option }, () => this.executeQuery(this.state.queryArtwork.id!, true));
    }

    changeMedium(option: string): void {
        this.setState({ mediumFilter: option }, () => this.executeQuery(this.state.queryArtwork.id!, false));
    }

    /**
     * Updates the result artwork; enables the rationale button if either artwork have rationale overlays
     * @param newResultArtwork the artwork to set as the new result
     * @param originalArtwork the original artwork
     */
    setResultArtwork(newResultArtwork: ArtMatch): void {
        let self = this;
        this.updateBestMatch(self, newResultArtwork)
    }

    /**
     * Updates the data uri that encodes a side-by-side composite image of the orignal and result artworks for sharing
     */
    updateImageDataURI(originalArtwork?: ArtObject, resultArtwork?: ArtObject) {
        // Height of the composite image in pixels
        let imageHeight = 400;

        // Use the image url in component state if no ArtObject is given
        let originalURL = originalArtwork ? originalArtwork.Thumbnail_Url : this.state.queryArtwork!.Thumbnail_Url;
        let resultURL = resultArtwork ? resultArtwork.Thumbnail_Url : this.state.chosenResultArtwork!.Thumbnail_Url;

        Jimp.read(originalURL)  // Read original image (left)
            .then((originalImage: any) => {
                Jimp.read(resultURL)    // Read the result image (right)
                    .then((resultImage: any) => {

                        // Define the target width of the two images
                        let originalImageWidth = originalImage.getWidth() * imageHeight / originalImage.getHeight();
                        let resultImageWidth = resultImage.getWidth() * imageHeight / resultImage.getHeight();

                        // Combine the two images
                        originalImage.resize(originalImageWidth, imageHeight)
                            .crop(0, 0, originalImageWidth + resultImageWidth, imageHeight)
                            .composite(resultImage.resize(resultImageWidth, imageHeight), originalImageWidth, 0)
                            .getBase64Async(Jimp.MIME_PNG)
                            .then((uri: any) => {

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

                                let filename = this.state.queryArtwork!.id + "_" + this.state.chosenResultArtwork!.id + ".jpg";
                                // Upload the composite image to hosting service
                                fetch("https://mosaicart.azurewebsites.net/upload?filename=" + encodeURIComponent(filename),
                                    requestOptions)
                                    .then(response => response.json())
                                    .then(result => {
                                        let shareURL = "https://mosaicart.azurewebsites.net/share";
                                        let params = `?image_url=${result.img_url}
                                        &redirect_url=${window.location.href}
                                        &title=Mosaic
                                        &description=${encodeURIComponent(
                                            this.state.queryArtwork!.Title + " and " + this.state.chosenResultArtwork.Title
                                        )}
                                        &width=${Math.round(originalImageWidth + resultImageWidth)}
                                        &height=${imageHeight}`;

                                        // Save the resulting sharing link to component state for use with social media sharing
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
        appInsights.trackEvent({ name: eventName, properties: properties });
    }


    updateBestMatch(component: any, match: ArtMatch) {
        lookup(match.id!)
            .then(function (responseJson) {
                component.setState({
                    chosenResultArtwork: new ArtObject(
                        responseJson.Artist,
                        responseJson.Classification,
                        responseJson.Culture,
                        responseJson.Image_Url,
                        responseJson.Museum,
                        responseJson.Museum_Page,
                        responseJson.Thumbnail_Url,
                        responseJson.Title,
                        responseJson.id),
                }, component.updateImageDataURI)
            })
    }

    /**
     * Queries API with the original artwork with conditional qualities
     */
    executeQuery(artworkID: string, promoteCultureMatch: boolean) {
        let self = this;
        lookupWithMatches(artworkID, self.state.cultureFilter, self.state.mediumFilter)
            .then(function (responseJson) {
                const cultureInfo = responseJson.matches.culture[self.state.cultureFilter]
                const mediumInfo = responseJson.matches.medium[self.state.mediumFilter]

                function infoToMatches(info: any): ArtMatch[] {
                    return info.ids.map(function (id: string, i: any) {
                        return new ArtMatch(info.urls[i], btoa(id));
                    })
                }
                const cultureMatches = infoToMatches(cultureInfo)
                const mediumMatches = infoToMatches(mediumInfo)
                self.setState({
                    queryArtwork: new ArtObject(
                        responseJson.Artist,
                        responseJson.Classification,
                        responseJson.Culture,
                        responseJson.Image_Url,
                        responseJson.Museum,
                        responseJson.Museum_Page,
                        responseJson.Thumbnail_Url,
                        responseJson.Title,
                        responseJson.id),
                    cultureItems: cultureMatches,
                    mediumItems: mediumMatches
                });
                if (promoteCultureMatch) {
                    return cultureMatches[0]
                } else {
                    return mediumMatches[0]
                }
            })
            .then(function (match) { self.updateBestMatch(self, match) })
    }

    /**
     * Intialization code for the explore webpage
     */
    componentDidMount() {
        let artworkID: string | null = null;

        //Get State from URL
        if (this.props.match.params.data) {
            const url = decodeURIComponent(this.props.match.params.data);
            if (url != null) {
                artworkID = url.split("&")[0].slice(4);
            }
        }

        //If the url has no parameters, randomly pick one from the default list.
        //Every art in the default list has Rationale available.
        if (artworkID == null) {
            let numDefaults = defaultIds.length;
            let randIndex = Math.floor(Math.random() * Math.floor(numDefaults));
            artworkID = defaultIds[randIndex];
        }

        this.executeQuery(artworkID!, false);

    }

    render() {
        return (
            <Stack className="main" role="main">     
            <NavBar />
            <div style={{ position: "relative", top: "-74px", width: "100%", overflow: "hidden" }}>
                <HideAt breakpoint="mediumAndBelow">
                    <div className="explore__background-banner">
                        <img className="explore__parallax" alt={"Banner comparing two artworks"} src={bannerImage} />
                        <div className="explore__banner-text">Find the building blocks of art that have transcended culture, medium, and time.</div>
                        <button onClick={() => this.scrollToReference(this.startRef)} className="explore__get-started button" >GET STARTED</button>
                    </div>
                    <div ref={this.startRef} className="explore__compare-block explore__solid">
                        <SubmitControl />
                        <Stack horizontal>
                            <Stack.Item className={halfStack} grow={1}>
                                <QueryArtwork
                                    artwork={this.state.queryArtwork}
                                    handleTrackEvent={this.handleTrackEvent} />
                            </Stack.Item>
                            <Stack.Item className={halfStack} grow={1}>
                                <ResultArtwork
                                    artwork={this.state.chosenResultArtwork}
                                    bestArtwork={this.state.chosenResultArtwork}
                                    handleTrackEvent={this.handleTrackEvent} />
                            </Stack.Item>
                        </Stack>
                    </div>
                </HideAt>
                <ShowAt breakpoint="mediumAndBelow">
                    <div className="explore__compare-block explore__solid">
                        <SubmitControl />
                        <Stack horizontal horizontalAlign="center" wrap>
                            <Stack.Item grow={1}>
                                <QueryArtwork
                                    artwork={this.state.queryArtwork}
                                    handleTrackEvent={this.handleTrackEvent} />
                            </Stack.Item>
                            <Stack.Item grow={1}>
                                <ResultArtwork
                                    artwork={this.state.chosenResultArtwork}
                                    bestArtwork={this.state.chosenResultArtwork} handleTrackEvent={this.handleTrackEvent} />
                            </Stack.Item>
                        </Stack>
                    </div>
                </ShowAt>
                <div className="explore__solid">
                    <Stack horizontalAlign="center">
                        <Stack horizontal horizontalAlign="center">
                            <div onClick={() => this.handleTrackEvent("Share", { "Network": "Facebook" })}>
                                <FacebookShareButton className="explore__share-button" url={this.state.shareLink!}>
                                    <FacebookIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                                </FacebookShareButton>
                            </div>
                            <div onClick={() => this.handleTrackEvent("Share", { "Network": "Twitter" })}>
                                <TwitterShareButton className="explore__share-button" title="Check out my Mosaic!" url={this.state.shareLink!}>
                                    <TwitterIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                                </TwitterShareButton>
                            </div>
                            <div onClick={() => this.handleTrackEvent("Share", { "Network": "Linkedin" })}>
                                <LinkedinShareButton className="explore__share-button" url={this.state.shareLink!}>
                                    <LinkedinIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                                </LinkedinShareButton>
                            </div>
                        </Stack>
                    </Stack>
                    <Separator />
                    <Stack horizontal horizontalAlign="start" verticalAlign="center" wrap>
                        <Options
                            default={this.state.cultureFilter}
                            choices={cultures}
                            changeConditional={this.changeCulture} />
                        <ListCarousel
                            items={this.state.cultureItems!}
                            setResultArtwork={this.setResultArtwork}
                            resultArtwork={this.state.chosenResultArtwork!} />
                    </Stack>
                    <Separator />
                    <Stack horizontal horizontalAlign="start" verticalAlign="center" wrap>
                        <Options
                            default={this.state.mediumFilter}
                            choices={media}
                            changeConditional={this.changeMedium} />
                        <ListCarousel
                            items={this.state.mediumItems!}
                            setResultArtwork={this.setResultArtwork}
                            resultArtwork={this.state.chosenResultArtwork!} />
                    </Stack>
                </div>
            </div>
            </Stack>
        )
    }
}

export default ExplorePage;
