import React, { Component } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import LazyLoad from 'react-lazyload';

import { Card, ICardSectionStyles } from '@uifabric/react-cards';
import { Image, mergeStyles, ImageFit } from 'office-ui-fabric-react';

interface IProps {
    key: any,
    data: any
}

const cardItemStyles: ICardSectionStyles = {
  root: {
    height: 10,
  }
};

/**
 * One box in the Result Grid
 * 'data' prop: json object from azure search index {@search.score, ObjectID, Department, Title, Culture, Medium, Classification, LinkResource, PrimaryImageUrl, Neighbors}
 */
export default class ResultBox extends Component<IProps> {
  constructor(props:any) {
    super(props);
    this.state = {};
  }

  render() {    
    return (
      <Card className="grid-card">
          <Card.Item className="grid-card__link">
            <a className="grid-card__load" href={this.props.data.Link_Resource} target="_blank" rel="noopener noreferrer">
                <LazyLoad
                throttle={250}
                height={200}
                offset={1000}
                placeholder={<CircularProgress style={{ color: '#6A6A6A' }} />}
                >
                    <img className="grid-card__img" src={this.props.data.Thumbnail_Url} />
                </LazyLoad>
            </a>
          </Card.Item>
          <Card.Item className="grid-card__title">
            <div>{!this.props.data.Title ? "Untitled Piece" : this.props.data.Title}</div>
          </Card.Item>
          <Card.Item className="grid-card__text">
            <div>{!this.props.data.Department ? "No description" : this.props.data.Department}</div>
          </Card.Item>
      </Card>
    );
  }
}