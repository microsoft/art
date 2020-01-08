import React from 'react';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
 
export class Carousel extends React.Component {
  render() {
    return (
      <CarouselProvider
        naturalSlideWidth={50}
        naturalSlideHeight={20}
        totalSlides={2}
      >
      <Slider>
        <Slide index={0}>
          <div>
            <img src = "https://www.seriouseats.com/recipes/images/20110408-soup-dumpling11.jpg" style={{width:'50%'}}/>
            <img src = "https://cdn.apartmenttherapy.info/image/fetch/f_jpg,q_auto:eco,c_fill,g_auto,w_1500,ar_4:3/https%3A%2F%2Fstorage.googleapis.com%2Fgen-atmedia%2F3%2F2013%2F08%2Fc141b08e0e35fc347bd20f1cf1071049b9db5297.jpeg" style={{width:'50%'}}/>
            <p>Dumplings in Different Cultures</p>
          </div>
        </Slide>
        <Slide index={1}>
          <div>
            <img src = "https://chipabythedozen.com/wp-content/uploads/2019/08/empanadas-de-pollo-bolivianas.jpg" style={{width:'50%'}}/>
            <img src = "https://d5dnlg5k9nac9.cloudfront.net/processed/thumbs/2c5d27277300f2ec8b0ca3faaf1a93b296284165_r791_530.png" style={{width:'50%'}}/>
            <p>Turnovers in Different Cultures</p>
          </div>
        </Slide>
      </Slider>
      <ButtonBack>Back</ButtonBack>
      <ButtonNext>Next</ButtonNext>
    </CarouselProvider>
    );
  }
}

export default Carousel;