import React, { Component } from 'react';
import logo from '../images/mosaicLogo.png';
import { FacebookIcon, FacebookShareButton, LinkedinIcon, LinkedinShareButton, TwitterIcon, TwitterShareButton } from 'react-share';
import { logEvent } from '../Shared/AppInsights';
import { slide as Menu } from 'react-burger-menu'
import { HideAt, ShowAt } from 'react-with-breakpoints';
import { Text } from 'office-ui-fabric-react';

const shareUrl = "https://microsoft.github.io/art/";

/**
 * NavBar across the top, the logo links to the Explore Page
 */
export default class NavBar extends Component {
  render() {
    return (
      <nav className="nav">
        <div>
          <a className="nav__link" href="/art/">
            <img src={logo} alt="" />
          </a>
        </div>
        <HideAt breakpoint="small">
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <div onClick={() => logEvent("Share", { "Network": "Facebook" })}>
              <FacebookShareButton className="explore__share-button" url={shareUrl}>
                <FacebookIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
              </FacebookShareButton>
            </div>
            <div onClick={() => logEvent("Share", { "Network": "Twitter" })}>
              <TwitterShareButton className="explore__share-button" title="Use AI to discover hidden connections in art!" url={shareUrl}>
                <TwitterIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
              </TwitterShareButton>
            </div>
            <div onClick={() => logEvent("Share", { "Network": "Linkedin" })}>
              <LinkedinShareButton className="explore__share-button" url={shareUrl}>
                <LinkedinIcon size={35} round={true} iconBgStyle={{ "fill": "black" }} />
              </LinkedinShareButton>
            </div>
            <a className="nav__text_link" href="/art/intro">
              intro
            </a>
          </div>
        </HideAt>

        <ShowAt breakpoint="small">
          <Menu right>
            <a className="nav__menu_link" href="/art/intro">
              Intro
            </a>
            <div className="nav__menu_link" >Share:</div>
            <div onClick={() => logEvent("Share", { "Network": "Facebook" })}>
              <FacebookShareButton className="explore__share-button" url={shareUrl}>
                <FacebookIcon size={35} round={true} iconBgStyle={{ "fill": "white" }} logoFillColor="black" />
              </FacebookShareButton>
            </div>
            <div onClick={() => logEvent("Share", { "Network": "Twitter" })}>
              <TwitterShareButton className="explore__share-button" title="Use AI to discover hidden connections in art!" url={shareUrl}>
                <TwitterIcon size={35} round={true} iconBgStyle={{ "fill": "white" }}  logoFillColor="black"/>
              </TwitterShareButton>
            </div>
            <div onClick={() => logEvent("Share", { "Network": "Linkedin" })}>
              <LinkedinShareButton className="explore__share-button" url={shareUrl}>
                <LinkedinIcon size={35} round={true} iconBgStyle={{ "fill": "white" }}  logoFillColor="black"/>
              </LinkedinShareButton>
            </div>


          </Menu>
        </ShowAt>
      </nav>
    )
  };

}
