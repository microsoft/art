import React from 'react';
import {Stack, Separator, mergeStyles} from 'office-ui-fabric-react';
import {Header} from './Header';
import Artwork from './Artwork';
import Options from './Options';
import GalleryItem from './GalleryItem';
import ListGrid from './Gallery';
import CollectionAdder from './CollectionAdder';
import {Buttons} from './Buttons';

const btmMargin = mergeStyles({
    marginBottom: 50
});

interface IProps {};

interface IState {
    current: GalleryItem,
    selected: GalleryItem,
    galleryItems: GalleryItem[]
    collections: any
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

export class App extends React.Component<IProps, IState> {
    
    constructor(props:any) {
        super(props);
        this.state = {
            current: defaultGalleryItem,
            selected: defaultSelectedGalleryItem,
            galleryItems: [defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem, defaultGalleryItem],
            collections: {'Collection 1': [defaultGalleryItem], 'Collection 2':[defaultGalleryItem, defaultGalleryItem]}
        }
        this.setSelected = this.setSelected.bind(this);
        this.addtoCollection = this.addtoCollection.bind(this);
        this.addCollection = this.addCollection.bind(this);
    }

    setCurrent(newCurrent: GalleryItem): void {
        this.setState({"current": newCurrent});
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
        const api_key = process.env.REACT_APP_RIJKSMUSEUM_API_KEY;
        const url = `https://www.rijksmuseum.nl/api/en/collection?key=${api_key}&ps=9`;

        fetch(url)
            .then((res) => {
                return res.json();
            })
            .then((resJson: any) => {
                let newItems: GalleryItem[] = [];
                resJson.artObjects.forEach((obj:any) => {
                    newItems.push(new GalleryItem(obj.webImage.url, obj.title, obj.principalOrFirstMaker));
                });
                this.setGalleryItems(newItems);
            });
    }

    render() {
        return (
            <Stack>
                <Stack className={btmMargin}>
                    <Header />
                </Stack>
                <Stack horizontal>
                    <Stack grow={1}>
                        <Artwork item={this.state.current} />
                        <CollectionAdder items={this.state.collections} addtoCollection={this.addtoCollection} addCollection={this.addCollection}/>
                        <Buttons 
                            setCurrent={() => this.setCurrent(this.state.selected)} 
                            reset={() => {this.setCurrent(defaultGalleryItem); this.setSelected(defaultSelectedGalleryItem)}}/>
                    </Stack>
                    <Separator vertical />
                    <Stack grow={1}>
                        <Options/>
                    </Stack>
                    <Separator vertical />
                    <Stack grow={1}>
                        <Artwork item={this.state.selected} />
                        <ListGrid items={this.state.galleryItems} setSelected={this.setSelected}/>
                    </Stack>
                </Stack>
            </Stack>
    
        );
    }
}
