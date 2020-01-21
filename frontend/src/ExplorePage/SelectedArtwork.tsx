import React from 'react';

import {Image, Text, Stack, DefaultButton, mergeStyles} from 'office-ui-fabric-react';
import GalleryItem from './GalleryItem';
import { Redirect } from 'react-router-dom';
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon } from 'react-share';

const spacerB = mergeStyles({
    padding: 10,
  });

interface IState {
    objIDs: any,
    redirect: any
}

type ArtworkProps = {
    item: GalleryItem
}

class SelectedArtwork extends React.Component < ArtworkProps, IState > {

    constructor(props:any) {
        super(props);
    
        this.state = {
          objIDs: [],
          redirect: false,
        };
        this.getSimilarArtID = this.getSimilarArtID.bind(this);
      }

    jsonToURI(json:any){ return encodeURIComponent(JSON.stringify(json)); }

    getSimilarArtID() {
        let imageURL = this.props.item.url;

        console.log(imageURL);
    
        const apiURL = 'https://gen-studio-apim.azure-api.net/met-reverse-search-2/FindSimilarImages/url';
        const key = '?subscription-key=7c02fa70abb8407fa552104e0b460c50&neighbors=20';
        const Http = new XMLHttpRequest();
        const data = new FormData();
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
    }

    render() {

        if (this.state.redirect) {
            let link = `/search/${this.jsonToURI(this.state.objIDs)}`;
            return <Redirect push to={link} />;
        } else {
            return (
                <Stack horizontal horizontalAlign="end" verticalAlign="center" className="explore__main-images">
                    <Stack verticalAlign="end" style={{"marginRight":10}}>
                      <Text style={{"textAlign":"right", "fontWeight":"bold"}} variant="xLarge">{this.props.item.title}</Text>
                      <Text style={{"textAlign":"right"}} variant="large">{this.props.item.principal}</Text>
                      <Stack>
                        <DefaultButton className="explore__buttons button" text="Search Similar" onClick={this.getSimilarArtID}/>
                        <DefaultButton className="explore__buttons button" text="View Source"/>
                        <Stack horizontal horizontalAlign="end">
                          <FacebookShareButton className="explore__share-button" quote="Check out Mosaic!" url={window.location.href}>
                            <FacebookIcon size={35} round={true} iconBgStyle={{"fill":"black"}} />
                          </FacebookShareButton>
                          <TwitterShareButton className="explore__share-button" title="Check out Mosaic!" url={window.location.href}>
                            <TwitterIcon size={35} round={true}  iconBgStyle={{"fill":"black"}} />
                          </TwitterShareButton>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack>
                      <Image height={"40vh"} src={this.props.item.url} className={spacerB}/>
                      <Text style={{"textAlign":"center", "fontWeight":"bold"}} variant="large">Original</Text>
                    </Stack>
                </Stack>
            )
        }


    }
};

export default SelectedArtwork;