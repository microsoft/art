import React from 'react';

import { Image, Text, Stack, DefaultButton, mergeStyles } from 'office-ui-fabric-react';
import GalleryItem from './GalleryItem';
import { Redirect } from 'react-router-dom';
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon, LinkedinShareButton, LinkedinIcon } from 'react-share';
import { HideAt, ShowAt } from 'react-with-breakpoints';
import { CSSTransition } from 'react-transition-group';

interface IState {
  objIDs: any,
  redirect: any,
  hover: boolean
}

type ArtworkProps = {
  item: any,
  handleTrackEvent: (eventName: string, properties: Object) => void
}

class SelectedArtwork extends React.Component<ArtworkProps, IState> {

  constructor(props: any) {
    super(props);

    this.state = {
      objIDs: [],
      redirect: false,
      hover: false
    };
    this.getSimilarArtID = this.getSimilarArtID.bind(this);
  }

  jsonToURI(json: any) { return encodeURIComponent(JSON.stringify(json)); }

  getSimilarArtID() {
    let imageURL = this.props.item.Thumbnail_Url;

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

  searchArtUrlSuffix() {
    let urlBase = '/search/';

    let idURL = '?id=' + this.props.item.id;
    let museumURL = '&museum=' + this.props.item.Museum;
    let url = encodeURIComponent(idURL + museumURL);
    return urlBase + url;
  }

  render() {
    if (this.state.redirect) {
      let link = `/search/${this.jsonToURI(this.state.objIDs)}`;
      return <Redirect push to={link} />;

    } else {
      return (
        <Stack horizontal horizontalAlign="end" verticalAlign="center" className="explore__main-images">
          <HideAt breakpoint="mediumAndBelow">
            <Stack verticalAlign="end" style={{ "marginRight": 10 }}>
              <Text style={{ "textAlign": "right", "fontWeight": "bold" }} variant="xLarge">{this.props.item.title}</Text>
              <Text style={{ "textAlign": "right" }} variant="large">{this.props.item.principal}</Text>
              <Stack horizontalAlign="end">
                <DefaultButton className="explore__buttons button" text="Search" href={this.searchArtUrlSuffix()} onClick={() => { this.props.handleTrackEvent("Search", {"Location": "OriginalImage"})}} />
                <DefaultButton className="explore__buttons button" text="Source" onClick={() => this.props.handleTrackEvent("Source", {"Location": "OriginalImage"})} />
                <Stack horizontal horizontalAlign="end">
                  <div onClick={() => this.props.handleTrackEvent("Share", { "Network": "Facebook" })}>
                    <FacebookShareButton className="explore__share-button" quote="Check out Mosaic!" url={window.location.href}>
                      <FacebookIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                    </FacebookShareButton>
                  </div>
                  <div onClick={() => this.props.handleTrackEvent("Share", { "Network": "Twitter" })}>

                    <TwitterShareButton className="explore__share-button" title="Check out Mosaic!" url={window.location.href}>
                      <TwitterIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                    </TwitterShareButton>
                  </div>
                  <div onClick={() => this.props.handleTrackEvent("Share", { "Network": "Linkedin" })}>
                    <LinkedinShareButton className="explore__share-button" url={window.location.href}>
                      <LinkedinIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
                    </LinkedinShareButton>
                  </div>
                </Stack>
              </Stack>
            </Stack>
            <Stack>
              <Image height={"40vh"} src={this.props.item.Thumbnail_Url} className="explore__img"/>
              <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="large">Original</Text>
            </Stack>
          </HideAt>
          <ShowAt breakpoint="mediumAndBelow">
            <Stack>
              <div className="explore__img-container" onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
                <Image height={"300px"} src={this.props.item.Thumbnail_Url} />
                <CSSTransition in={this.state.hover} timeout={0} classNames="explore__slide">
                  <Stack horizontal className="explore__slide-buttons">
                    <a href={this.searchArtUrlSuffix()} onClick={() => {this.props.handleTrackEvent("Search", {"Location":"OriginalImage"})}} className="explore__slide-button-link">Search</a>
                    <div className="explore__slide-button-sep"></div>
                    <a href="" className="explore__slide-button-link" target="_blank" rel="noopener noreferrer" onClick={() => this.props.handleTrackEvent("Source", {"Location":"OrignalImage"})}>Source</a>
                  </Stack>
                </CSSTransition>
              </div>
              <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="large">Original</Text>
            </Stack>
          </ShowAt>
        </Stack>
      )
    }
  }
};

export default SelectedArtwork;