import { Image, Stack, Text } from 'office-ui-fabric-react';
import { DirectionalHint, TooltipDelay, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { HideAt, ShowAt } from 'react-with-breakpoints';
import ArtObject from '../ArtObject';
import rijksImg from '../images/Rijks.jpg';
import metImg from '../images/the_met_logo_crop.png';
import Options from './Options';



interface IState {
  objIDs: any,
  redirect: any,
  hover: boolean,
  overlayOn: boolean
}

type ArtworkProps = {
  artwork: ArtObject,
  overlay: string,
  enableRationale: boolean,
  handleTrackEvent: (eventName: string, properties: Object) => void, 
  changeConditional: any
}

class OriginalArtwork extends React.Component<ArtworkProps, IState> {

  constructor(props: any) {
    super(props);

    this.state = {
      objIDs: [],
      redirect: false,
      hover: false,
      overlayOn: false
    };
    this.getSimilarArtID = this.getSimilarArtID.bind(this);
    this.toggleOverlay = this.toggleOverlay.bind(this);
  }

  jsonToURI(json: any) { return encodeURIComponent(JSON.stringify(json)); }

  toggleOverlay() {
    if (this.props.overlay) {
      let newValue = !this.state.overlayOn;
      this.setState({overlayOn: newValue});
    }
  }

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
    let musImg = (this.props.artwork.Museum === 'rijks') ? <img style={{height:'5vh'}} id='musButton1' src={rijksImg} /> : <img style={{height:'5vh'}} id='musButton1' src={metImg} />;
    let imgURL = this.state.overlayOn ? this.props.overlay : this.props.artwork.Thumbnail_Url;
    let rationaledisable = this.props.overlay ? false : true;
    
    if (this.state.redirect) {
      let link = `/search/${this.jsonToURI(this.state.objIDs)}`;
      return <Redirect push to={link} />;

    } else {
      return (
        <React.Fragment>
          <HideAt breakpoint="mediumAndBelow">
            <Stack horizontal horizontalAlign="end" verticalAlign="center" className="explore__main-images">
              <Stack verticalAlign="end" style={{ "marginRight": 20 }}>
                <Text block nowrap style={{ "textAlign": "right", "fontWeight": "bold" , "width":"20vw"}} variant="xLarge">{this.props.artwork.Title ? this.props.artwork.Title : "Untitled Piece"}</Text>
                <Text style={{ "textAlign": "right" }} variant="large">{this.props.artwork.Culture}</Text>
                <Text style={{ "textAlign": "right", "marginBottom": 15 }} variant="large">{this.props.artwork.Classification}</Text>
                <Stack horizontalAlign="end">
                  <a href={this.searchArtUrlSuffix()}>
                    <button className="explore__buttons button" onClick={() => { this.props.handleTrackEvent("Search", { "Location": "OriginalImage" }) }}>Search</button>
                  </a>
                  {this.props.enableRationale &&
                  <button className="explore__buttons button" disabled={rationaledisable}  onClick={this.toggleOverlay}>Show Rationale</button>
                  }
                  
                  <Options changeConditional={this.props.changeConditional} />
                </Stack>
              </Stack>
              <Stack>
                <div className="explore__artwork-frame">
                  <Image height={"35vh"} src={imgURL} className="explore__img" />
                  <div className="explore__museum-icon">
                    <TooltipHost delay={TooltipDelay.medium} closeDelay={0} directionalHint={DirectionalHint.bottomCenter} content="View Source" calloutProps={{ gapSpace: 0, target: `#musButton1` }}>
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
                  <Image height={"275px"} src={imgURL} />
                  <CSSTransition in={this.state.hover} timeout={0} classNames="explore__slide">
                    <Stack horizontal horizontalAlign="center" className="explore__slide-buttons">
                      <a href={this.searchArtUrlSuffix()} onClick={() => { this.props.handleTrackEvent("Search", { "Location": "OriginalImage" }) }} className="explore__slide-button-link">Search</a>
                      {this.props.enableRationale &&
                      <a onClick={() => { this.props.handleTrackEvent("Rationale", { "Location": "OriginalImage" }); this.toggleOverlay(); }} className="explore__slide-button-link">Rationale</a>                      
                      }
                      </Stack>
                  </CSSTransition>
                  <div className="explore__museum-icon">
                    <TooltipHost delay={TooltipDelay.medium} closeDelay={0} directionalHint={DirectionalHint.bottomCenter} content="View Source" calloutProps={{ gapSpace: 0, target: `#musButton1` }}>
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