import React from "react";
import { Stack } from 'office-ui-fabric-react';
import NavBar from '../Shared/NavBar';
import { logEvent } from '../Shared/AppInsights';

interface IProps {
    history: any
};

export default class FairnessPage extends React.Component<IProps> {
    constructor(props: any) {
        super(props);
    }


    render() {
        return (
<Stack className="main" role="main">
                <NavBar />
                <div className="page-wrap" style={{ position: "relative", top: "80px", width: "100%", overflow: "hidden"}}>
                    <div className="explore__banner-text-2">Before we get started:</div>
                    <div className="explore__solid">
                            <Stack horizontal horizontalAlign="center" verticalAlign="center" wrap>
                                <div className="explore__disclaimer-text">
                                 Art, culture, and heritage are sensitive subjects that require respect.
                                 This work aims to celebrate culture and diversity and explore art in a new way.
                                 AI has known biases and the results or artworks within this tool do not reflect 
                                 the views of Microsoft, MIT, or the authors. We ask users to be respectfull of other's cultures and to use this tool responsibly. 
                                 Some artworks or matches might not be approporiate for all ages, or might be culturally inappropriate.
                                 We have released this tool as-is, and encourage users to read our <a href="https://github.com/microsoft/art/blob/master/transparency_note.md">transparency note</a> for more info. Thanks!  </div>
                            </Stack>

                            <Stack horizontalAlign="center" style={{paddingTop: "2%"}}>
                                    <button className="explore__buttons button"  onClick={() => {
                                        this.props.history.push("/app");
                                        logEvent("Agree", {});

                                    }}>I Understand</button>
                            </Stack>
                            
                    </div>              
                </div>
            </Stack>
        )
    }

}
