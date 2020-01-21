import React from 'react';
import {Stack, mergeStyles} from 'office-ui-fabric-react';
import {NavBar} from './NavBar/NavBar';

import ExplorePage from './ExplorePage/ExplorePage';
import SearchPage from "./SearchPage/SearchPage";
import AboutPage from "./AboutPage/AboutPage";

import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

const btmMargin = mergeStyles({
    marginBottom: 15,
});

interface IProps {};

interface IState {};

export class App extends React.Component {
    render() {
        return (
            <Router>
                <Stack className="main" role="main">
                    <Stack className={btmMargin}>
                        <NavBar />
                    </Stack>
                    <Switch>
                        <Route exact path="/search/:id" component={SearchPage} />
                        <Route exact path="/about" component={AboutPage} />
                        <Route path="/:data" component={ExplorePage} /> 
                        <Route exact path="/" component={ ExplorePage } />
                    </Switch>

                    
                </Stack>
            </Router>
        );
    }
}

