import React from 'react';

import { Image, Text, Stack, DefaultButton, mergeStyles } from 'office-ui-fabric-react';
import { DirectionalHint, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import ArtObject from '../ArtObject';
import { Redirect } from 'react-router-dom';
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon, LinkedinShareButton, LinkedinIcon } from 'react-share';
import { HideAt, ShowAt } from 'react-with-breakpoints';
import { CSSTransition } from 'react-transition-group';

import metImg from '../images/the_met_logo_crop.png';
import rijksImg from '../images/Rijks.jpg';

interface IState {
  objIDs: any,
  redirect: any,
  hover: boolean
}

type ArtworkProps = {
  artwork: ArtObject,
  handleTrackEvent: (eventName: string, properties: Object) => void
}

class OriginalArtwork extends React.Component<ArtworkProps, IState> {

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

  render() {
    let musImg = (this.props.artwork.Museum === 'rijks') ? <Image height={"5vh"} id='musButton1' src={rijksImg} /> : <Image height={"5vh"} id='musButton1' src={metImg} />;
    if (this.state.redirect) {
      let link = `/search/${this.jsonToURI(this.state.objIDs)}`;
      return <Redirect push to={link} />;

    } else {
      return (
        <React.Fragment>
          <HideAt breakpoint="mediumAndBelow">
            <Stack horizontal horizontalAlign="end" verticalAlign="center" className="explore__main-images">
              <Stack verticalAlign="end" style={{ "marginRight": 10 }}>
                <Text style={{ "textAlign": "right", "fontWeight": "bold" }} variant="xLarge">{this.props.artwork.Title}</Text>
                <Text style={{ "textAlign": "right" }} variant="large">{this.props.artwork.Culture}</Text>
                <Text style={{ "textAlign": "right" }} variant="large">{this.props.artwork.Classification}</Text>
                <Stack horizontalAlign="end">
                  <a href={this.searchArtUrlSuffix()}>
                    <button className="explore__buttons button" onClick={() => { this.props.handleTrackEvent("Search", { "Location": "OriginalImage" }) }}>Search</button>
                  </a>
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
                <div className="explore__artwork-frame">
                  <Image height={"40vh"} src={this.props.artwork.Thumbnail_Url} className="explore__img" />
                  <div className="explore__museum-icon">
                    <TooltipHost closeDelay={300} directionalHint={DirectionalHint.bottomRightEdge} content="click to view source1" calloutProps={{ gapSpace: 0, target: `#musButton1` }}>
                      <a href={this.props.artwork.Museum_Page} target="_blank" rel="noopener noreferrer">
                        {musImg}
                      </a>
                    </TooltipHost>
                  </div>
                </div>
                <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="large">Original</Text>
              </Stack>
            </Stack>
          </HideAt>
          <ShowAt breakpoint="mediumAndBelow">
            <Stack horizontal horizontalAlign="center" verticalAlign="center" className="explore__main-images">
              <Stack onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
                <Stack className="explore__img-container" onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
                  <Image height={"300px"} src={this.props.artwork.Thumbnail_Url} />
                  <CSSTransition in={this.state.hover} timeout={0} classNames="explore__slide">
                    <Stack horizontal horizontalAlign="center" className="explore__slide-buttons">
                      <a href={this.searchArtUrlSuffix()} onClick={() => { this.props.handleTrackEvent("Search", { "Location": "OriginalImage" }) }} className="explore__slide-button-link">Search</a>
                    </Stack>
                  </CSSTransition>
                  <div className="explore__museum-icon">
                    <TooltipHost closeDelay={300} directionalHint={DirectionalHint.bottomRightEdge} content="click to view source1" calloutProps={{ gapSpace: 0, target: `#musButton1` }}>
                      <a href={this.props.artwork.Museum_Page} target="_blank" rel="noopener noreferrer">
                        {musImg}
                      </a>
                    </TooltipHost>
                  </div>
                </Stack>
                <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="large">Original</Text>
              </Stack>
            </Stack>
          </ShowAt>
        </React.Fragment>
      )
    }
  }
};

export default OriginalArtwork;