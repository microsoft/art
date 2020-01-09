import React from 'react';
import {Stack, Separator, mergeStyles} from 'office-ui-fabric-react';
import {Header} from './Header';
import Artwork from './Artwork';
import Options from './Options';
import GalleryItem from './GalleryItem';
import ListGrid from './Gallery';
import CollectionAdder from './CollectionAdder';
import {Buttons} from './Buttons';
import ExplorePage from './ExplorePage/ExplorePage';
import HomePage from "./HomePage/HomePage";
import SearchPage from "./SearchPage/SearchPage";
import SelectPage from "./SelectPage/SelectPage";

import {BrowserRouter as Router, Route} from 'react-router-dom';

const btmMargin = mergeStyles({
    marginBottom: 50
});

interface IProps {};

interface IState {};

export class App extends React.Component {
    render() {
        return (
            <Router>
                <Stack className="main" role="main">
                    <Stack className={btmMargin}>
                        <Header />
                    </Stack>
                    <Route exact path="/" component={HomePage} />
                    <Route exact path="/explore" component={ExplorePage} />
                    <Route exact path="/search" component={SearchPage} />
                    <Route exact path="/select" component={SelectPage} />
                </Stack>
            </Router>
        );
    }
}
