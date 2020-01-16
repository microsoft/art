import React from 'react';
import {Stack, mergeStyles} from 'office-ui-fabric-react';
import {NavBar} from './NavBar/NavBar';

import ExplorePage from './ExplorePage/ExplorePage';
import SearchPage from "./SearchPage/SearchPage";
import SelectPage from "./SelectPage/SelectPage";

import {BrowserRouter as Router, Route} from 'react-router-dom';

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
                    <Route exact path="/" component={SelectPage} />
                    <Route exact path="/explore/:data" component={ExplorePage} />
                    <Route exact path="/search/:id" component={SearchPage} />
                    <Route exact path="/select" component={SelectPage} />
                </Stack>
            </Router>
        );
    }
}
