import React, { Component } from 'react';
import logo from '../images/mosaicLogo.png';

/**
 * The Navigational Bar across the top of the page
 */
interface IProps {
};

interface IState {
};

/**
 * NavBar across the top, the logo links to the Explore Page
 */
export default class NavBar extends Component<IProps, IState> {
    render() {
      return (
        <nav className="nav">
          <div>
            <a className="nav__link" href="/art/">
              <img src={logo} alt=""/>
            </a>
          </div>
          <div>
            <a className="nav__text_link" href="/art/intro">
              intro
            </a>
          </div>
        </nav>   
      )
    };

}
