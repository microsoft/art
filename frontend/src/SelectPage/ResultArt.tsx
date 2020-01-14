import React, { Component } from 'react';

import Slider from 'react-slick';

interface IProps {
    images: any,
    categorySelected: any,
    selectImage: any,
    selectedImage: any
};

interface IState {
    selectedID: any
}

/**
 * The grid of thumbnails of art
 *  images : List of ObjIDs to be displayed
 *  selectedImage : the currently selected image
 *  selectImage : callback to change the selected image
 *  categorySelected : the selected category
 */
export default class ResultArt extends Component<IProps, IState> {
  constructor(props:any) {
    super(props);

    this.state = {
      selectedID: 0,
    };
  }

  render() {
    const settings = {
      className: 'center',
      centerMode: true,
      infinite: true,
      centerPadding: '60px',
      slidesToShow: 5,
      speed: 500,
      swipeToSlide: true,
      adaptiveHeight: true,
      responsive: [
        {
          breakpoint: 1680,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4,
            infinite: true,
          }
        },
        {
          breakpoint: 1440,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true
          }
        },
        {
          breakpoint: 1000,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            initialSlide: 2
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };

    let imagesToDisplay = this.props.images;
    if (this.props.categorySelected) {
      imagesToDisplay = imagesToDisplay.slice(0, 6);
    }

    const listItems = imagesToDisplay.map((image:any, i:any) => (
      <div className="slick-img-container">
        <img 
          className="slick-img"
          src={image.img}
          alt={image.id}
          onClick={() => {this.props.selectImage(image.key, image.id);}}
          style={this.props.selectedImage.key === image.key ?
          { borderColor: '#002050', borderWidth: '4px' } :
          { borderColor: '#ffffff', borderWidth: '4px' }}
        />
      </div>
    ))

    return <Slider {...settings}>{listItems}</Slider>;
  }
}