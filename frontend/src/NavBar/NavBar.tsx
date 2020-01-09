import React, { Component } from 'react';

import {Text, FontIcon, mergeStyles } from 'office-ui-fabric-react';
import {initializeIcons} from 'office-ui-fabric-react/lib/Icons';

const iconClass = mergeStyles({
    paddingTop: 10,
    paddingRight: 10,
    color: "#005a9e"
});

initializeIcons();


export default class NavBar extends Component {

    render() {
        return(
            <nav className="nav">
                <a className="nav__link" href="/">
                    <Text variant="xxLarge">
                        <FontIcon iconName="BranchSearch" className={iconClass} />
                        Deep Culture Explorer
                    </Text>

                </a>
          </nav>
        );
    }

}