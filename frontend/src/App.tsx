// import './main.scss';
import { initializeIcons} from 'office-ui-fabric-react';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import withAppInsights from './Shared/AppInsights';
import ExplorePage from './ExplorePage/ExplorePage';
import SearchPage from "./SearchPage/SearchPage";
import IntroPage from "./IntroPage/IntroPage";

initializeIcons();

class App extends React.Component {
    render() {
        return (
            <Router basename={process.env.PUBLIC_URL}>
                <Switch>
                    <Route exact path="/" component={ IntroPage } />
                    <Route path="/search/:id" component={SearchPage} />
                    <Route exact path="/search" component={SearchPage} />
                    <Route path="/app/:data" component={ExplorePage} /> 
                    <Route exact path="/app" component={ ExplorePage } />
                </Switch>
            </Router>
        );
    }
}

export default withAppInsights(App);