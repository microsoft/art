import React, { Component } from 'react';
import { Stack, ImageFit, Image } from 'office-ui-fabric-react';
import CircularProgress from '@material-ui/core/CircularProgress';
import LazyLoad from 'react-lazyload';
import { CSSTransition } from 'react-transition-group';

import { Card } from '@uifabric/react-cards';

interface IProps {
    key: any,
    data: any
}

interface IState {
  hover: boolean
}

/**
 * One box in the Result Grid
 * 'data' prop: json object from azure search index {@search.score, ObjectID, Department, Title, Culture, Medium, Classification, LinkResource, PrimaryImageUrl, Neighbors}
 */
export default class ResultBox extends Component<IProps, IState> {
  constructor(props:any) {
    super(props);
    this.state = {
      hover: false
    };
  }

  exploreArtUrlSuffix() {
    let urlBase = '/explore/';
    let url = '?url=' + this.props.data.Thumbnail_Url + '&title='+this.props.data.Title;
    url = encodeURIComponent(url);
    return urlBase + url;
  }

  render() {    
    return (
      <Card className="grid-card" onMouseEnter={()=>this.setState({hover:true})} onMouseLeave={()=>this.setState({hover:false})}>
        <Card.Item className="grid-card__link">
          <a href={this.props.data.Link_Resource} target="_blank" rel="noopener noreferrer">
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
        <Card.Item className="grid-card__title">
          <div>{!this.props.data.Title ?
                "Untitled Piece" :
                this.props.data.Title.length < 55 ? this.props.data.Title : this.props.data.Title.substring(0,55) + "..."}</div>
        </Card.Item>
        <Card.Item className="grid-card__text">
          <div>{!this.props.data.Department ? "No description" : this.props.data.Department}</div>
        </Card.Item>
        <Card.Item>
        <CSSTransition in={this.state.hover} timeout={0} classNames="grid-card__slide">
            <Stack horizontal className="grid-card__buttons">
              <a href={this.exploreArtUrlSuffix()} className="grid-card__button_link">Explore</a>
              <div className="grid-card__button_sep"></div>
              <a href={this.props.data.Link_Resource} className="grid-card__button_link" target="_blank" rel="noopener noreferrer">Details</a>
            </Stack>
        </CSSTransition>
        </Card.Item>
      </Card>
    );
  }
}