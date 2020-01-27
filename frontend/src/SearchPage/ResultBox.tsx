import CircularProgress from '@material-ui/core/CircularProgress';
import { Card } from '@uifabric/react-cards';
import { Image, ImageFit, Stack } from 'office-ui-fabric-react';
import React, { Component } from 'react';
import LazyLoad from 'react-lazyload';
import { CSSTransition } from 'react-transition-group';


interface IProps {
  key: any,
  data: any,
  handleTrackEvent: (eventName: string, properties: Object) => void
}

interface IState {
  hover: boolean
}

/**
 * One box in the Result Grid
 * 'data' prop: json object from azure search index {@search.score, ObjectID, Department, Title, Culture, Medium, Classification, LinkResource, PrimaryImageUrl, Neighbors}
 */
export default class ResultBox extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      hover: false
    };
  }

  exploreArtUrlSuffix() {
    let urlBase = '/';
    let idURL = '?id=' + this.props.data.id;
    let museumURL = '&museum=' + this.props.data.Museum;
    let url = encodeURIComponent(idURL + museumURL);
    return urlBase + url;
  }

  render() {
    let museumName = this.props.data.Museum === "met" ? "The Met" : "Rijksmuseum";
    return (

      <Card className="grid-card" onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
        <Card.Item className="grid-card__link">
          <a href={this.props.data.Museum_Page} target="_blank" rel="noopener noreferrer">
              <LazyLoad
              throttle={250}
              height={200}
              offset={1000}
              placeholder={<CircularProgress style={{ color: '#6A6A6A' }} />}
            >
              <Image className="grid-card__img" alt="thumbnail" src={this.props.data.Thumbnail_Url} imageFit={ImageFit.contain} />
            </LazyLoad>
          </a>
        </Card.Item>
        <Card.Item>
          <div className="grid-card__title">{!this.props.data.Title ?
            "Untitled Piece" :
            this.props.data.Title.length < 55 ? this.props.data.Title : this.props.data.Title.substring(0, 55) + "..."}</div>
        </Card.Item>
        <Card.Item>
          <div className="grid-card__text">{museumName}</div>
          <div className="grid-card__text">{!this.props.data.Artist ? "No known artist" : this.props.data.Artist}</div>          
        </Card.Item>
        <Card.Item>
          <CSSTransition in={this.state.hover} timeout={0} classNames="grid-card__slide">
            <Stack horizontal className="grid-card__buttons">
              <a href={this.props.data.Museum_Page} onClick={() => this.props.handleTrackEvent("Source", {"Location":"SearchPage", "ArtLink":this.props.data.Link_Resource})} className="grid-card__button_link" target="_blank" rel="noopener noreferrer">Source</a>
              <div className="grid-card__button_sep"></div>
              <a href={this.exploreArtUrlSuffix()} onClick={() => this.props.handleTrackEvent("Matches", {"Location":"SearchPage", "ArtLink":this.props.data.Link_Resource})} className="grid-card__button_link">Matches</a>
            </Stack>
          </CSSTransition>
        </Card.Item>
      </Card>
    );
  }
}