import React from 'react';
import GalleryItem from './GalleryItem';
import Slider from 'react-slick';
import ArtObject from '../ArtObject';

import metImg from '../images/the_met_logo_crop.png';
import rijksImg from '../images/Rijks.jpg';

interface IProps {
    items: ArtObject[],
    setResultArtwork: (item: any) => void,
    resultArtwork: ArtObject
}

interface IState {

}

class ListCarousel extends React.Component<IProps, IState> {
    // constructor(props: IProps) {
    //     super(props);
    // }

    createGrid(): JSX.Element[] {
        let grid: JSX.Element[] = [];

        this.props.items.forEach((item: any, i: number) => {
            grid.push(
                <div className="explore__card-img-container" key={i} onClick={()=>this.props.setResultArtwork(item)}>
                    <img alt={item.title} className="explore__card-img" style={item.id === this.props.resultArtwork.id ? {"border":"4px solid black"} : {"border":"4px solid white"}} src={item.Thumbnail_Url}/>
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
            responsive: [
              {
                breakpoint: 1650,
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
                breakpoint: 980,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 2,
                  initialSlide: 2
                }
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1
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