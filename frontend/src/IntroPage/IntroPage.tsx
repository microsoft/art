import React, { Component } from "react";
import Iframe from 'react-iframe'

export default class IntroPage extends Component {

    render() {
        return (
            <div className="iframe-holder" style={{"width":"100vw", "height":"100vh", "margin":"0px", "padding":"0px","overflow":"hidden"}}>
            <Iframe url="https://mmlsparkdemo.blob.core.windows.net/mosaic/intro/index.html"
                scrolling="no"
                position="relative"
                width="100%"
                frameBorder={0}
                height="100%"
                />
            </div>
        
        )
    }

}
