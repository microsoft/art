  
import React, { Component } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import LazyLoad from 'react-lazyload';

import { Card, ICardSectionStyles } from '@uifabric/react-cards';
import { Image } from 'office-ui-fabric-react';

interface IProps {
    key: any,
    data: any
}

const cardItemStyles: ICardSectionStyles = {
    root: {
      maxHeight: 100,
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

  //Material UI version
  render() {    
    return (
      <div className="grid-card">
        <a className="grid-card__link" href={this.props.data.Link_Resource} target="_blank" rel="noopener noreferrer">
        <LazyLoad
          throttle={250}
          height={500}
          offset={100}
          placeholder={<CircularProgress style={{ color: '#6A6A6A' }} />}
        >
          <img className="grid-card__img" alt="met search result" src={this.props.data.Thumbnail_Url}/>
        </LazyLoad>
        </a>
        <p className="grid-card__title">{this.props.data.Title}</p>
        <p className="grid-card__text">{this.props.data.Department}</p>
      </div>
    );
  }

//   render() {    
//     return (
//       <Card>
//           <Card.Item>
//             <a className="grid-card__link" href={this.props.data.Link_Resource} target="_blank" rel="noopener noreferrer">
//                 <LazyLoad
//                 throttle={250}
//                 height={500}
//                 offset={100}
//                 placeholder={<CircularProgress style={{ color: '#6A6A6A' }} />}
//                 >
//                     <Image src={this.props.data.Thumbnail_Url} />
//                 </LazyLoad>
//             </a>
//           </Card.Item>
//           <Card.Item styles={cardItemStyles}>
//             <p className="grid-card__title">{this.props.data.Title}</p>
//             <p className="grid-card__text">{this.props.data.Department}</p>
//           </Card.Item>
//       </Card>
//     );
//   }  
}