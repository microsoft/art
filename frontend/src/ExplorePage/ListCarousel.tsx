import React from 'react';
import Slider from 'react-slick';
import { ArtObject, ArtMatch } from '../Shared/ArtSchemas';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Image } from 'office-ui-fabric-react';
import LazyLoad from 'react-lazyload';

interface IProps {
  items: ArtMatch[],
  selectorCallback: (item: any) => void,
  selectedArtwork: ArtObject | null
}

interface IState {

}

class ListCarousel extends React.Component<IProps, IState> {

  createGrid(): JSX.Element[] {
    let grid: JSX.Element[] = [];    
    this.props.items.forEach((item: any, i: number) => {

      let isSelected = false
      if (this.props.selectedArtwork !== null && item.id === this.props.selectedArtwork!.id) {
        isSelected = true
      }
      grid.push(
        <div className="explore__card-img-container" key={i} onClick={() => this.props.selectorCallback(item)}>
          <LazyLoad
            throttle={250}
            height={200}
            offset={1000}
            placeholder={<CircularProgress style={{ color: '#6A6A6A' }} />}>
            <Image alt={item.title} className="explore__card-img" style={isSelected ? { "border": "4px solid black" } : { "border": "4px solid white" }} src={item.Thumbnail_Url} />
          </LazyLoad>
        </div>
      );
    })

    return grid;
  }

  render(): JSX.Element {
    const settings = {
      centerMode: true,
      infinite: true,
      centerPadding: '60px',
      slidesToShow: 5,
      speed: 500,
      swipeToSlide: true,
      adaptiveHeight: true,
      focusOnSelect: true,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1650,
          settings: {
            slidesToShow: 4,
            infinite: true,
          }
        },
        {
          breakpoint: 1440,
          settings: {
            slidesToShow: 3,
            infinite: true
          }
        },
        {
          breakpoint: 980,
          settings: {
            slidesToShow: 2,
            initialSlide: 2
          }
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: 1,
          }
        }
      ]
    };

    return (
      <div className="explore__grid-list-container">
        <Slider {...settings}>{this.createGrid()}</Slider>
      </div>
    )
  }
}

export default ListCarousel;