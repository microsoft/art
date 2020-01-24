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
    current: GalleryItem,
    selected: GalleryItem,
    bestItem: GalleryItem,
    imageDataURI: string;
    galleryItems: GalleryItem[],
    collections: any,
    conditionals: any,
    url: any
}

const halfStack = mergeStyles({
    width: "50%",
    height: "100%"
})

const defaultGalleryItem = new GalleryItem(
    "https://lh3.googleusercontent.com/J-mxAE7CPu-DXIOx4QKBtb0GC4ud37da1QK7CzbTIDswmvZHXhLm4Tv2-1H3iBXJWAW_bHm7dMl3j5wv_XiWAg55VOM=s0",
    "The Night Watch",
    "Rembrandt van Rijn"
);

const defaultSelectedGalleryItem = new GalleryItem(
    "https://upload.wikimedia.org/wikipedia/commons/a/a4/The_Peacemakers_1868.jpg",
    "The Peacemakers",
    "George Peter Alexander Healy"
)

export class ExplorePage extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props);
        this.state = {
            current: defaultGalleryItem,
            selected: defaultSelectedGalleryItem,
            bestItem: defaultSelectedGalleryItem,
            imageDataURI: "",
            galleryItems: [defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem],
            collections: { 'Collection 1': [defaultGalleryItem], 'Collection 2': [defaultGalleryItem, defaultGalleryItem] },
            conditionals: { 'Culture': 'All', 'Medium': "All" },
            url: ''
        }
        this.setSelected = this.setSelected.bind(this);
        this.addtoCollection = this.addtoCollection.bind(this);
        this.addCollection = this.addCollection.bind(this);
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

    addtoCollection(collection: string): void {
        let newcollect = { ...this.state.collections };
        newcollect[collection].push(this.state.current);
        this.setState({ 'collections': newcollect });
    }

    addCollection(collection: string): void {
        let newcollect = { ...this.state.collections };
        newcollect[collection] = [this.state.current];
        this.setState({ 'collections': newcollect });
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

    componentWillMount() {
        // const api_key = process.env.REACT_APP_RIJKSMUSEUM_API_KEY;
        // const url = `https://www.rijksmuseum.nl/api/en/collection?key=${api_key}&ps=9`;

        // fetch(url)
        //     .then((res) => {
        //         return res.json();
        //     })
        //     .then((resJson: any) => {
        //         let newItems: GalleryItem[] = [];
        //         resJson.artObjects.forEach((obj:any) => {
        //             newItems.push(new GalleryItem(obj.webImage.url, obj.title, obj.principalOrFirstMaker));
        //         });
        //         this.setGalleryItems(newItems);
        //     });
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
                    let pieces = response.map((result: any) => new GalleryItem(
                        result["img_url"],
                        result["title"],
                        result["museum"]
                    ));

                    this.setState({ "galleryItems": pieces, "selected": pieces[0], "bestItem": pieces[0] });



                } catch (e) {
                    console.log('malformed request:' + Http.responseText);
                }
            }
        }
    }

    componentDidMount() {
        //Decode the url data
        let url = this.props.match.params.data
        if (url) {
            let realurl = url.toString();
            realurl = decodeURIComponent(realurl);
            let selectedArt = realurl.split("&")[0].slice(5); //gives url of artwork
            let selectedTitle = realurl.split("&")[1].slice(6); //gives title of artwork
            //Continue with other params as desired
            //const paintingUrl = thumbnailRoot + selectedArt + ".jpg";
            const paintingUrl = selectedArt;
            let newGalleryItem = new GalleryItem(
                paintingUrl,
                selectedTitle,
                "WHO who, WHO who"
            );

            this.makeAPIquery(selectedArt, this.state.conditionals);


            this.setState({ "current": newGalleryItem });
        } else {
            let selectedArt = 'https://lh3.googleusercontent.com/ib8SNTK2Qk-z64UYuu-_mI3FswMpYmmNU871wu5diDEPyjxmYJcNI4qRtqxlvKkVnrXTAxAFkuHX7DAN9ZwPFzS5fGE=s0';
            let selectedTitle = "Lady who says 'who'";

            const paintingUrl = selectedArt;
            let newGalleryItem = new GalleryItem(
                paintingUrl,
                selectedTitle,
                "WHO who, WHO who"
            );

            this.makeAPIquery(selectedArt, this.state.conditionals);


            this.setState({ "current": newGalleryItem });
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
