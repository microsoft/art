// import './main.scss';
import React from 'react';
import {Stack, mergeStyles} from 'office-ui-fabric-react';
import NavBarNew from './NavBar/NavBarNew';

import ExplorePage from './ExplorePage/ExplorePage';
import SearchPage from "./SearchPage/SearchPage";
import AboutPage from "./AboutPage/AboutPage";

import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import { initializeIcons } from 'office-ui-fabric-react';

import withAppInsights from './AppInsights';


initializeIcons();

const btmMargin = mergeStyles({
    marginBottom: 15,
});

interface IProps {};

interface IState {};

class App extends React.Component {
    render() {
        return (
            <Router basename={process.env.PUBLIC_URL}>
                <Stack className="main" role="main">
                    <Stack className={btmMargin}>
                        <NavBarNew />
                    </Stack>
                    <Switch>
                        <Route path="/search/:id" component={SearchPage} />
                        <Route exact path="/search" component={SearchPage} />
                        <Route exact path="/about" component={AboutPage} />
                        <Route path="/:data" component={ExplorePage} /> 
                        <Route exact path="/" component={ ExplorePage } />
                    </Switch>
                </Stack>
            </Router>
        );
    }
}

export default withAppInsights(App);