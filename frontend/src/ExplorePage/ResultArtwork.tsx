import React from 'react';

import {Image, Text, Stack, ImageFit, DefaultButton, mergeStyles} from 'office-ui-fabric-react';
import GalleryItem from './GalleryItem';
import { Redirect } from 'react-router-dom';

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

class ResultArtwork extends React.Component < ArtworkProps, IState > {

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
    console.log(this.props.item);
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
            <Stack horizontalAlign="start" verticalAlign="center" horizontal className={spacerB}>
                <Image src={this.props.item.url} height={400} className={spacerB}/>
                <Stack style={{"marginLeft":10}}>
                  <Text style={{"fontWeight":"bold"}} variant="xLarge">{this.props.item.title}</Text>
                  <Text variant="large">{this.props.item.principal}</Text>
                  <Stack>
                    <DefaultButton className="button" style={{"marginTop":10}} text="Search Similar" onClick={this.getSimilarArtID}/>
                    <DefaultButton className="button" style={{"marginTop":10}} text="View Source"/> 
                  </Stack>
                </Stack>
            </Stack>
        )
      }


    }
};

export default ResultArtwork;