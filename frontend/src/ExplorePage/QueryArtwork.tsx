import { Image, Stack, Text } from 'office-ui-fabric-react';
import { DirectionalHint, TooltipDelay, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import React from 'react';
import { HideAt, ShowAt } from 'react-with-breakpoints';
import { ArtObject } from '../Shared/ArtSchemas';
import rijksImg from '../images/Rijks.jpg';
import metImg from '../images/the_met_logo_crop.png';

interface IState {
  objIDs: any,
  hover: boolean
}

type ArtworkProps = {
  artwork: ArtObject,
}

// Component for the original image that is used for the query (left image)
export default class QueryArtwork extends React.Component<ArtworkProps, IState> {

  constructor(props: any) {
    super(props);

    this.state = {
      objIDs: [],
      hover: false
    };
  }

  jsonToURI(json: any) { return encodeURIComponent(JSON.stringify(json)); }

  render() {
    let musImg = (this.props.artwork.Museum === 'rijks') ? <img style={{height:'5vh'}} id='musButton1' alt={"The Rijksmuseum Icon"} src={rijksImg} /> : <img style={{height:'5vh'}} id='musButton1' alt={"The Met Museum Icon"} src={metImg} />;
    let imgURL = this.props.artwork.Thumbnail_Url;
    
    return (
      <React.Fragment>
        <HideAt breakpoint="mediumAndBelow">
          <Stack horizontal horizontalAlign="end" verticalAlign="center" className="explore__main-images">
            <Stack verticalAlign="end" style={{ "marginRight": 20 }}>
              <Text block style={{ "textAlign": "right", "fontWeight": "bold" , "width":"15vw"}} variant="xLarge">{this.props.artwork.Title ? this.props.artwork.Title : "Untitled Piece"}</Text>
              <Text style={{ "textAlign": "right", "textTransform": "capitalize"}} variant="large">{this.props.artwork.Culture.replace(/_/g, " ")}</Text>
              <Text style={{ "textAlign": "right", "marginBottom": 15 , "textTransform": "capitalize"}} variant="large">{this.props.artwork.Classification.replace(/_/g, " ")}</Text>
            </Stack>
            <Stack>
              <div className="explore__artwork-frame" onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
                <Image height={"35vh"} style={{"maxWidth":"30vw", "objectFit":"cover"}} src={imgURL} className="explore__img" />
                <div className="explore__museum-icon">
                  <TooltipHost delay={TooltipDelay.medium} closeDelay={0} directionalHint={DirectionalHint.bottomCenter} content="View Source" calloutProps={{ gapSpace: 0, target: `#musButton1` }}>
                    <a href={this.props.artwork.Museum_Page} target="_blank" rel="noopener noreferrer">
                      {musImg}
                    </a>
                  </TooltipHost>
                </div>
              </div>
              <Text style={{ "textAlign": "center", "fontWeight": "bold", "paddingTop": "10px" }} variant="large">Query Image</Text>
            </Stack>
          </Stack>
        </HideAt>
        <ShowAt breakpoint="mediumAndBelow">
          <Stack horizontal horizontalAlign="center" verticalAlign="center" className="explore__main-images">
            <Stack onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
              <Stack className="explore__img-container" onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
                <Image height={"275px"} style={{"maxWidth":"100%", "objectFit": "cover"}} src={imgURL} />
                <div className="explore__museum-icon">
                  <TooltipHost delay={TooltipDelay.medium} closeDelay={0} directionalHint={DirectionalHint.bottomCenter} content="View Source" calloutProps={{ gapSpace: 0, target: `#musButton1` }}>
                    <a href={this.props.artwork.Museum_Page} target="_blank" rel="noopener noreferrer">
                      {musImg}
                    </a>
                  </TooltipHost>
                </div>
              </Stack>
              <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="large">Query Image</Text>
            </Stack>
          </Stack>
        </ShowAt>
      </React.Fragment>
    )
    
  }
};
