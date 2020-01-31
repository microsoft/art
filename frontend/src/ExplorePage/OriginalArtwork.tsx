import { Image, Stack, Text } from 'office-ui-fabric-react';
import { DirectionalHint, TooltipDelay, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { HideAt, ShowAt } from 'react-with-breakpoints';
import ArtObject from '../ArtObject';
import rijksImg from '../images/Rijks.jpg';
import metImg from '../images/the_met_logo_crop.png';



interface IState {
  objIDs: any,
  redirect: any,
  hover: boolean
}

type ArtworkProps = {
  artwork: ArtObject,
  overlay: string,
  overlayOn: boolean,
  handleTrackEvent: (eventName: string, properties: Object) => void, 
  changeConditional: any
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
    let musImg = (this.props.artwork.Museum === 'rijks') ? <img style={{height:'5vh'}} id='musButton1' src={rijksImg} /> : <img style={{height:'5vh'}} id='musButton1' src={metImg} />;
    //let imgURL = this.state.overlayOn ? this.props.overlay : this.props.artwork.Thumbnail_Url;
    let imgURL = this.props.artwork.Thumbnail_Url;
    console.log("overlayOn: "+this.props.overlayOn);
    console.log("Overlay: "+this.props.overlay);
    if (this.props.overlayOn && this.props.overlay) {
      imgURL = this.props.overlay
    }
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
                <Text block style={{ "textAlign": "right", "fontWeight": "bold" , "width":"15vw"}} variant="xLarge">{this.props.artwork.Title ? this.props.artwork.Title : "Untitled Piece"}</Text>
                <Text style={{ "textAlign": "right", "textTransform": "capitalize"}} variant="large">{this.props.artwork.Culture}</Text>
                <Text style={{ "textAlign": "right", "marginBottom": 15 , "textTransform": "capitalize"}} variant="large">{this.props.artwork.Classification}</Text>
              </Stack>
              <Stack>
                <div className="explore__artwork-frame" onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
                  <Image height={"35vh"} style={{"maxWidth":"30vw", "objectFit":"cover"}} src={imgURL} className="explore__img" />
                  <CSSTransition in={this.state.hover} timeout={0} classNames="explore__slide">
                    <Stack horizontal horizontalAlign="center" className="explore__slide-buttons">
                      <a href={this.searchArtUrlSuffix()} onClick={() => { this.props.handleTrackEvent("Search", { "Location": "OriginalImage" }) }} className="explore__slide-button-link">Search</a>
                      </Stack>
                  </CSSTransition>
                  <div className="explore__museum-icon">
                    <TooltipHost delay={TooltipDelay.medium} closeDelay={0} directionalHint={DirectionalHint.bottomCenter} content="View Source" calloutProps={{ gapSpace: 0, target: `#musButton1` }}>
                      <a href={this.props.artwork.Museum_Page} target="_blank" rel="noopener noreferrer">
                        {musImg}
                      </a>
                    </TooltipHost>
                  </div>
                </div>
                <Text style={{ "textAlign": "center", "fontWeight": "bold", "paddingTop": "10px" }} variant="large">Original</Text>
              </Stack>
            </Stack>
          </HideAt>
          <ShowAt breakpoint="mediumAndBelow">
            <Stack horizontal horizontalAlign="center" verticalAlign="center" className="explore__main-images">
              <Stack onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
                <Stack className="explore__img-container" onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
                  <Image height={"275px"} style={{"maxWidth":"100%", "objectFit": "cover"}} src={imgURL} />
                  <CSSTransition in={this.state.hover} timeout={0} classNames="explore__slide">
                    <Stack horizontal horizontalAlign="center" className="explore__slide-buttons">
                      <a href={this.searchArtUrlSuffix()} onClick={() => { this.props.handleTrackEvent("Search", { "Location": "OriginalImage" }) }} className="explore__slide-button-link">Search</a>
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