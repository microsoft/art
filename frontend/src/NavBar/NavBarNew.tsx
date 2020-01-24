import React, { Component } from 'react';
import logo from './mosaicLogo.png';

/**
 * The Navigational Bar across the top of the page
 */
interface IProps {

};

interface IState {

};


class NavBarNew extends Component<IProps, IState> {

    render() {
        return (
          <nav className="nav">
            <a className="nav__link" href="/">
              <img src={logo} alt=""/>
            </a>
            <a className="nav__link" href="/about">
              <div className="nav__text">
                About
              </div>
            </a>
          </nav>   
        )
    };

}

export default NavBarNew;