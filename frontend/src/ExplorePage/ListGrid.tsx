import React from 'react';
import GalleryItem from './GalleryItem';
import Slider from 'react-slick';

interface IProps {
    items: any[],
    setSelected: (item: any) => void,
    selected: any
}

interface IState {

}

class ListGrid extends React.Component<IProps, IState> {
    // constructor(props: IProps) {
    //     super(props);
    // }

    createGrid(): JSX.Element[] {
        let grid: JSX.Element[] = [];

        this.props.items.forEach((item: any, i: number) => {
            grid.push(
                <div className="explore__card-img-container" key={i} onClick={()=>this.props.setSelected(item)}>
                    <img alt={item.title} className="explore__card-img" style={item.id === this.props.selected.id ? {"border":"4px solid black"} : {"border":"4px solid white"}} src={item.Thumbnail_Url}/>
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
            slidesToShow: 6,
            speed: 500,
            swipeToSlide: true,
            adaptiveHeight: true,
            focusOnSelect: true,
            responsive: [
              {
                breakpoint: 1650,
                settings: {
                  slidesToShow: 5,
                  slidesToScroll: 5,
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