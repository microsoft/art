import React from 'react';

import { Image, Text, Stack, DefaultButton, mergeStyles } from 'office-ui-fabric-react';
import { DirectionalHint, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import ArtObject from '../ArtObject';
import { Redirect } from 'react-router-dom';
import { ShowAt, HideAt } from 'react-with-breakpoints';
import { CSSTransition } from 'react-transition-group';
import { appInsights } from '../AppInsights';

import metImg from '../images/the_met_logo_crop.png';
import rijksImg from '../images/Rijks.jpg';

import { useConst } from '@uifabric/react-hooks';



interface IState {
  objIDs: any,
  redirect: any,
  hover: boolean
}

type ArtworkProps = {
  artwork: ArtObject,
  bestArtwork: ArtObject,
  handleTrackEvent: (eventName: string, properties: Object) => void
}

class ResultArtwork extends React.Component<ArtworkProps, IState> {

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
    let imageURL = this.props.artwork.Thumbnail_Url;

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

    let idURL = '?id=' + this.props.artwork.id;
    let museumURL = '&museum=' + this.props.artwork.Museum;
    let url = encodeURIComponent(idURL + museumURL);
    return urlBase + url;
  }

  exploreArtUrlSuffix() {
    let urlBase = '/';
    let idURL = '?id=' + this.props.artwork.id;
    let museumURL = '&museum=' + this.props.artwork.Museum;
    let url = encodeURIComponent(idURL + museumURL);
    //console.log(url);
    return urlBase + url;
  }

  render() {

    let musImg = (this.props.artwork.Museum === 'rijks') ? <Image height={"5vh"} id='musButton2' src={rijksImg} /> : <Image height={"5vh"} id='musButton2' src={metImg} />; 

    if (this.state.redirect) {
      let link = `/search/${this.jsonToURI(this.state.objIDs)}`;
      return <Redirect push to={link} />;
    } else {

      return (
        <Stack horizontal horizontalAlign="start" verticalAlign="center" className="explore__main-images">
          <HideAt breakpoint="mediumAndBelow">
            <Stack>
              <div className="explore__artwork-frame"> 
                <Image height={"40vh"} src={this.props.artwork.Thumbnail_Url} className="explore__img" />
                <div className="explore__museum-icon">
                  <TooltipHost closeDelay={300} directionalHint={DirectionalHint.bottomRightEdge} content="click to view source2" calloutProps={{gapSpace: 0, target: `#musButton2`}}>
                    <a href={this.props.artwork.Museum_Page} target="_blank" rel="noopener noreferrer">
                      {musImg}
                    </a>
                  </TooltipHost>
                </div>
              </div>
              <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="large">{this.props.artwork.id === this.props.bestArtwork.id ? "Best Match" : "Close Match"}</Text>
              
              </Stack>
            <Stack style={{ "marginLeft": 10 }}>
              <Text style={{ "fontWeight": "bold" }} variant="xLarge">{this.props.artwork.Title}</Text>
              <Text variant="large">{this.props.artwork.Culture}</Text>
              <Text  variant="large">{this.props.artwork.Classification}</Text>
              <Stack>
                <DefaultButton className="explore__buttons button" text="Search" href={this.searchArtUrlSuffix()} onClick={() => {this.props.handleTrackEvent("Search", {"Location": "ResultImage"})}} />
                <DefaultButton className="explore__buttons button" text="Source" onClick={() => this.props.handleTrackEvent("Source", {"Location": "ResultImage"})}/>
                <DefaultButton className="explore__buttons button" text="Matches" href={this.exploreArtUrlSuffix()} onClick={() => this.props.handleTrackEvent("Matches", "ResultImage")}/>
              </Stack>
            </Stack>
          </HideAt>
          <ShowAt breakpoint="mediumAndBelow">
            <Stack>
            <div className="explore__img-container" onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>

                <div className="explore__artwork-frame"> 
                <Image height={"300px"} src={this.props.artwork.Thumbnail_Url} />
                  <CSSTransition in={this.state.hover} timeout={0} classNames="explore__slide">
                    <Stack horizontal className="explore__slide-buttons">
                      <a href={this.searchArtUrlSuffix()} onClick={() => {this.props.handleTrackEvent("Search", {"Location": "ResultImage"})}} className="explore__slide-button-link">Search</a>
                      <div className="explore__slide-button-sep"></div>
                      <a href="" onClick={() => this.props.handleTrackEvent("Source", {"Location": "ResultImage"})} className="explore__slide-button-link" target="_blank" rel="noopener noreferrer">Source</a>
                      <div className="explore__slide-button-sep"></div>
                      <a href={this.exploreArtUrlSuffix()} onClick={() => this.props.handleTrackEvent("Matches", {"Location": "ResultImage"})} className="explore__slide-button-link">Matches</a>
                    </Stack>
                  </CSSTransition>
                  <div className="explore__museum-icon">
                    <TooltipHost closeDelay={300} directionalHint={DirectionalHint.bottomRightEdge} content="click to view source2" calloutProps={{gapSpace: 0, target: `#musButton2`}}>
                      <a href={this.props.artwork.Museum_Page} target="_blank" rel="noopener noreferrer">
                        {musImg}
                      </a>
                    </TooltipHost>
                  </div>
                </div>
              </div>
              <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="large">{this.props.artwork.id === this.props.bestArtwork.id ? "Best Match" : "Close Match"}</Text>
            </Stack>
          </ShowAt>
        </Stack>
      )
    }
  }
};

export default ResultArtwork;