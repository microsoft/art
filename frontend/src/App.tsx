// import './main.scss';
import { initializeIcons, mergeStyles, Stack } from 'office-ui-fabric-react';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import withAppInsights from './AppInsights';
import ExplorePage from './ExplorePage/ExplorePage';
import NavBarNew from './NavBar/NavBarNew';
import SearchPage from "./SearchPage/SearchPage";

initializeIcons();

interface IProps {};

interface IState {};

class App extends React.Component {
    render() {
        return (
            <Router basename={process.env.PUBLIC_URL}>
                <Stack className="main" role="main">
                    <NavBarNew />
                    <Switch>
                        <Route path="/search/:id" component={SearchPage} />
                        <Route exact path="/search" component={SearchPage} />
                        <Route path="/:data" component={ExplorePage} /> 
                        <Route exact path="/" component={ ExplorePage } />
                    </Switch>
                </Stack>
            </Router>
        );
    }
}

export default withAppInsights(App);