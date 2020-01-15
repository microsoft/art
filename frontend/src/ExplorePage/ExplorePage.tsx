import React from 'react';
import {Stack, Separator} from 'office-ui-fabric-react';
import SelectedArtwork from './SelectedArtwork';
import ResultArtwork from './ResultArtwork';
import Options from './Options';
import GalleryItem from './GalleryItem';
import ListGrid from './Gallery';
import {Buttons} from './Buttons';

interface IProps {
    match: any
};

interface IState {
    current: GalleryItem,
    selected: GalleryItem,
    galleryItems: GalleryItem[],
    collections: any,
    conditionals: any,
    url: any
}

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
    
    constructor(props:any) {
        super(props);
        this.state = {
            current: defaultGalleryItem,
            selected: defaultSelectedGalleryItem,
            galleryItems: [defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem],
            collections: {'Collection 1': [defaultGalleryItem], 'Collection 2':[defaultGalleryItem, defaultGalleryItem]},
            conditionals: {'Culture':'All', 'Medium':"All"},
            url: ''
        }
        this.setSelected = this.setSelected.bind(this);
        this.addtoCollection = this.addtoCollection.bind(this);
        this.addCollection = this.addCollection.bind(this);
        this.changeConditional = this.changeConditional.bind(this);
    }

    setCurrent(newCurrent: GalleryItem): void {
        this.setState({"current": newCurrent});
    }

    changeConditional(thing:any, thing2?:any): void {
        let clonedConditionals = { ...this.state.conditionals};
        clonedConditionals[thing] = thing2['text'];
        console.log(clonedConditionals);
        this.setState({"conditionals": clonedConditionals});
    }

    setSelected(newSelected: GalleryItem): void {
        this.setState({"selected": newSelected});
    }

    setGalleryItems(newItems: GalleryItem[]): void {
        this.setState({"galleryItems": newItems});
    }

    addtoCollection(collection: string): void{
        let newcollect = {...this.state.collections};
        newcollect[collection].push(this.state.current);
        this.setState({'collections': newcollect});
    }

    addCollection(collection:string): void{
        let newcollect = {...this.state.collections};
        newcollect[collection] = [this.state.current];
        this.setState({'collections': newcollect});
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

    componentDidMount() {
        //Decode the url data
        let url = this.props.match.params.data.toString();
        url = decodeURIComponent(url);
        let selectedArt = url.split("&")[0].slice(5); //gives url of artwork
        let selectedTitle = url.split("&")[1].slice(6); //gives title of artwork
        //Continue with other params as desired
        const thumbnailRoot = "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/";
        //const paintingUrl = thumbnailRoot + selectedArt + ".jpg";
        const paintingUrl = selectedArt;
        let newGalleryItem = new GalleryItem(
            paintingUrl,
            selectedTitle,
            "WHO who, WHO who"
        );

        const apiURL = 'http://art-backend.azurewebsites.net/explore';
        let params = '?url='+selectedArt + '&numResults=' + '9';
        //let params = '?id=2738' + '&museum=' + 'rijks' + '&numResults=' + '10'
        console.log(apiURL+params);

        const Http = new XMLHttpRequest();
        Http.open('GET', apiURL+params);

        Http.send();
        Http.onreadystatechange = e => {
            if (Http.readyState === 4) {
                try {
                    let response = JSON.parse(Http.responseText);
                    console.log(response);
                    //let ids = response.results.map((result:any) => result.ObjectID);
                    let pieces = response.map((result:any) => new GalleryItem(
                        result["img_url"],
                        result["title"],
                        result["museum"]
                    ));

                    this.setState({"galleryItems": pieces, "selected": pieces[0]});

                    
                    
                } catch (e) {
                console.log('malformed request:' + Http.responseText);
                }
            }
        }



        this.setState({"current": newGalleryItem});
      }    

    render() {
        return (
            <Stack horizontal>
                <Stack grow={1}>
                    <SelectedArtwork item={this.state.current} />
                    {/* <Buttons 
                        setCurrent={() => this.setCurrent(this.state.selected)} 
                        reset={() => {this.setCurrent(defaultGalleryItem); this.setSelected(defaultSelectedGalleryItem)}}/> */}
                    <Separator/>
                    <Options
                        callback={this.changeConditional}
                    />
                </Stack>
                <Separator vertical />
                <Stack grow={1}>
                    <ResultArtwork item={this.state.selected} />
                    <ListGrid items={this.state.galleryItems} setSelected={this.setSelected}/>
                </Stack>
            </Stack>
        );
    }
}

export default ExplorePage
