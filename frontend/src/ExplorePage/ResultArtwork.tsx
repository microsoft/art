import React from 'react';

import { Image, Text, Stack, DefaultButton, mergeStyles } from 'office-ui-fabric-react';
import GalleryItem from './GalleryItem';
import { Redirect } from 'react-router-dom';
import { ShowAt, HideAt } from 'react-with-breakpoints';

const spacerB = mergeStyles({
  padding: 10,
});

interface IState {
  objIDs: any,
  redirect: any,
}

type ArtworkProps = {
  item: GalleryItem
}

class ResultArtwork extends React.Component<ArtworkProps, IState> {

  constructor(props: any) {
    super(props);

    this.state = {
      objIDs: [],
      redirect: false,
    };
    this.getSimilarArtID = this.getSimilarArtID.bind(this);
  }

  jsonToURI(json: any) { return encodeURIComponent(JSON.stringify(json)); }

  getSimilarArtID() {
    let imageURL = this.props.item.url;

    const apiURL = 'https://gen-studio-apim.azure-api.net/met-reverse-search-2/FindSimilarImages/url';
    const key = '?subscription-key=7c02fa70abb8407fa552104e0b460c50&neighbors=20';
    const Http = new XMLHttpRequest();
    const data = new FormData();
    data.append('urlInput', imageURL);

    Http.open('POST', apiURL + key);
    //Http.send(data);
    Http.send(JSON.stringify({ "urlInput": imageURL }));
    Http.onreadystatechange = e => {
      if (Http.readyState === 4) {
        try {
          let response = JSON.parse(Http.responseText);
          let ids = response.results.map((result: any) => result.ObjectID);
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

  exploreArtUrlSuffix() {
    let urlBase = '/';

    //let urlURL = '?url=' + thumbnailRoot + this.state.selectedImage.id.toString() + ".jpg";
    let urlURL = '?url=' + this.props.item.url;
    let titleURL = '&title=' + this.props.item.title;
    let url = encodeURIComponent(urlURL + titleURL);
    return urlBase + url;
  }


  render() {
    if (this.state.redirect) {
      let link = `/search/${this.jsonToURI(this.state.objIDs)}`;
      return <Redirect push to={link} />;
    } else {

      return (
        <Stack horizontal horizontalAlign="start" verticalAlign="center" className="explore__main-images">
          <HideAt breakpoint="mediumAndBelow">
            <Stack>
              <Image height={"40vh"} src={this.props.item.url} className={spacerB} />
              <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="large">Result</Text>
            </Stack>
            <Stack style={{ "marginLeft": 10 }}>
              <Text style={{ "fontWeight": "bold" }} variant="xLarge">{this.props.item.title}</Text>
              <Text variant="large">{this.props.item.principal}</Text>
              <Stack>
                <DefaultButton className="explore__buttons button" text="Search Similar" onClick={this.getSimilarArtID} />
                <DefaultButton className="explore__buttons button" text="View Source" />
                <DefaultButton className="explore__buttons button" text="Explore Similar" href={this.exploreArtUrlSuffix()} />
              </Stack>
            </Stack>
          </HideAt>
          <ShowAt breakpoint="mediumAndBelow">
            <Stack>
              <Image height={"300px"} src={this.props.item.url} className={spacerB} />
              <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="large">Result</Text>
            </Stack>
          </ShowAt>
        </Stack>
      )
    }
  }
};

export default ResultArtwork;