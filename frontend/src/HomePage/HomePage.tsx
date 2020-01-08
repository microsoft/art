import React from 'react';
import {Carousel} from './Carousel';
import {Link} from "react-router-dom";

interface IProps {};

interface IState {};


export class HomePage extends React.Component<IProps, IState> {

    render() {
        return(
            <div>
                <Link to="/explore">Explore!  </Link>
                <Link to="/search">Search!</Link>
                <h1>Examples</h1> 
                <Carousel/>
            </div>
        );
    }

}

export default HomePage
