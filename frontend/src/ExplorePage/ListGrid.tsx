import React from 'react';
import { Stack, Image, ImageFit} from 'office-ui-fabric-react';
import { Card } from '@uifabric/react-cards';
import GalleryItem from './GalleryItem';
import Slider from 'react-slick';

interface IProps {
    items: GalleryItem[],
    setSelected: (item: GalleryItem) => void
}

interface IState {

}

class ListGrid extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }

    createGrid(): JSX.Element[] {
        let grid: JSX.Element[] = [];

        this.props.items.forEach((item: GalleryItem, i: number) => {
            grid.push(
                <div className="explore__card-img-container">
                    <img alt={item.title} className="explore__card-img" src={item.url}/>
                </div>
            );
        })

        return grid;
    }

    render(): JSX.Element {
        const settings = {
            className: 'center',
            centerMode: true,
            infinite: true,
            centerPadding: '60px',
            slidesToShow: 5,
            speed: 500,
            swipeToSlide: true,
            // adaptiveHeight: true,
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

export default ListGrid;