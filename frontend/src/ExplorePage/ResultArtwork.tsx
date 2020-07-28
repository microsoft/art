import { Image, Stack, Text } from 'office-ui-fabric-react';
import { Shimmer, ShimmerElementType } from 'office-ui-fabric-react/lib/Shimmer';
import { DirectionalHint, TooltipDelay, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import React from 'react';
import { HideAt, ShowAt } from 'react-with-breakpoints';
import { ArtObject} from '../Shared/ArtSchemas';
import rijksImg from '../images/Rijks.jpg';
import metImg from '../images/the_met_logo_crop.png';


interface IState {
  objIDs: any,
  hover: boolean
}

type ArtworkProps = {
  artwork: ArtObject,
}

// Component for the currently selected result image (right image)
class ResultArtwork extends React.Component<ArtworkProps, IState> {

  constructor(props: any) {
    super(props);

    this.state = {
      objIDs: [],
      hover: false
    };
  }

  jsonToURI(json: any) { return encodeURIComponent(JSON.stringify(json)); }


  render() {

    var musImg
    if (this.props.artwork.Museum === 'rijks') {
      musImg = <img style={{ height: '5vh' }} id='musButton2' alt={"The Rijksmuseum Icon"} src={rijksImg} /> 
    } else{
      musImg = <img style={{ height: '5vh' }} id='musButton2' alt={"The Met Museum Icon"} src={metImg} />
    };

    const imgURL = this.props.artwork.Thumbnail_Url;
    let dataLoaded = this.props.artwork.id == null ? false : true;

    return (
      <React.Fragment>
        <HideAt breakpoint="mediumAndBelow">
          <Stack horizontal horizontalAlign="start" verticalAlign="center" className="explore__main-images">
            <Stack>
              <Shimmer isDataLoaded={dataLoaded} shimmerElements={[{ type: ShimmerElementType.line, height: 340, width: 300 }]} ariaLabel="loading content">
                <div className="explore__artwork-frame">
                  <Image height={"35vh"} style={{ "maxWidth": "30vw", "objectFit": "cover" }} src={imgURL} className="explore__img" />
                  <div className="explore__museum-icon">
                    <TooltipHost delay={TooltipDelay.medium} closeDelay={0} directionalHint={DirectionalHint.bottomCenter} content="View Source" calloutProps={{ gapSpace: 0, target: `#musButton2` }}>
                      <a href={this.props.artwork.Museum_Page} target="_blank" rel="noopener noreferrer">
                        {musImg}
                      </a>
                    </TooltipHost>
                  </div>
                </div>
              </Shimmer>
              <Text style={{ "textAlign": "center", "fontWeight": "bold", "paddingTop": "10px" }} variant="large">{"Close Match"}</Text>
            </Stack>
            <Stack style={{ "marginLeft": 20 }}>
              <Text block style={{ "fontWeight": "bold", "width": "15vw" }} variant="xLarge">{this.props.artwork.Title ? this.props.artwork.Title : "Untitled Piece"}</Text>
              <Text style={{ "textTransform": "capitalize" }} variant="large">{this.props.artwork.Culture.replace(/_/g, " ")}</Text>
              <Text variant="large" style={{ "marginBottom": 15, "textTransform": "capitalize" }}>{this.props.artwork.Classification.replace(/_/g, " ")}</Text>
            </Stack>
          </Stack>
        </HideAt>
        <ShowAt breakpoint="mediumAndBelow">
          <Stack horizontal horizontalAlign="center" verticalAlign="center" className="explore__main-images">
            <Stack>
              <div className="explore__img-container">
                <Shimmer isDataLoaded={dataLoaded} shimmerElements={[{ type: ShimmerElementType.line, height: 280, width: 230 }]} ariaLabel="loading content">
                  <div className="explore__artwork-frame">
                    <Image height={"275px"} style={{ "maxWidth": "100%", "objectFit": "cover" }} src={imgURL} />
                    <div className="explore__museum-icon">
                      <TooltipHost delay={TooltipDelay.medium}
                        closeDelay={0}
                        directionalHint={DirectionalHint.bottomCenter}
                        content="View Source"
                        calloutProps={{ gapSpace: 0, target: `#musButton2` }}>
                        <a href={this.props.artwork.Museum_Page} target="_blank" rel="noopener noreferrer">
                          {musImg}
                        </a>
                      </TooltipHost>
                    </div>
                  </div>
                </Shimmer>
              </div>
              <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="large">{"Close Match"}</Text>
            </Stack>
          </Stack>
        </ShowAt>
      </React.Fragment>
    )

  }
};

export default ResultArtwork;