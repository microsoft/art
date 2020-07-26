// import './main.scss';
import { initializeIcons, Stack } from 'office-ui-fabric-react';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import withAppInsights from './Shared/AppInsights';
import ExplorePage from './ExplorePage/ExplorePage';
import NavBar from "./Shared/NavBar";
import SearchPage from "./SearchPage/SearchPage";
import IntroPage from "./IntroPage/IntroPage";

initializeIcons();

interface IProps {};

interface IState {};

class App extends React.Component {
    render() {
        return (
            <Router basename={process.env.PUBLIC_URL}>
                <Switch>
                    <Route exact path="/intro" component={ IntroPage } />
                    <Route path="/search/:id" component={SearchPage} />
                    <Route exact path="/search" component={SearchPage} />
                    <Route path="/:data" component={ExplorePage} /> 
                    <Route exact path="/" component={ ExplorePage } />
                </Switch>
            </Router>
        );
    }
}

export default withAppInsights(App);