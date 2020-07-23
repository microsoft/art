import { Separator, Stack } from 'office-ui-fabric-react';
import React from 'react';
import { appInsights } from '../Shared/AppInsights';
import SearchControl from './SearchControl';
import SearchGrid from './SearchGrid';
import TagList from './TagList';
import { search} from '../Shared/SearchTools';


interface IProps {
  match: any
};

interface IState {
  terms: string[],                              // Current search query terms to be displayed
  activeFilters: { [key: string]: Set<string> },    // Active tags used for filtering the search results
  facets: { [key: string]: string[] },              // Available filtering tags for the current search terms (currently top 5 most common tags)
  results: object[]                             // Search results
};

const facetNames = ["Culture", "Museum", "Classification"];


export class SearchPage extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      terms: ['*'], // Current search query to be displayed
      activeFilters: {},
      facets: {},
      results: []
    };
    this.updateTerms = this.updateTerms.bind(this);
    this.clearActiveFilters = this.clearActiveFilters.bind(this);
    this.selectAndApplyFilters = this.selectAndApplyFilters.bind(this);
    this.handleTrackEvent = this.handleTrackEvent.bind(this);

    //AppInsights.downloadAndSetup({ instrumentationKey: "7ca0d69b-9656-4f4f-821a-fb1d81338282" });
    //AppInsights.trackPageView("Search Page");
  }

  componentDidMount() {
    const searchTerm = this.props.match.params.id; // The Search term from the Explore Page

    if (searchTerm) {
      let decodedSearchTerm = decodeURIComponent(searchTerm);

      let queryString = decodedSearchTerm.split("&")[0].slice(7);
      this.setState({terms:[queryString]},() => this.executeSearch(true));  
    } else {
      this.setState({ terms: ["*"] }, () => this.executeSearch(true))
    }
  }



  /**
   * This function creates a brand new search query request and refreshes all tags and results in the current state
   * @param updateFacets whether to retrieve new filter tags after the search (e.g. French, Sculptures)
   */
  executeSearch(updateFacets: boolean): void {
    let self = this
    search(self.state.terms, facetNames, self.state.activeFilters)
      .then(function (responseJson) {
        if (updateFacets) {
          self.setState({ facets: responseJson["@search.facets"], results: responseJson.value });
        }
        else {
          self.setState({ results: responseJson.value });
        }

      });
  }

  uriToJSON(urijson: any) { return JSON.parse(decodeURIComponent(urijson)); }

  updateTerms(newTerms: any) {
    this.setState({ terms: newTerms}, () => this.executeSearch(true));
  }

  clearActiveFilters() {
    this.setState({ activeFilters: {} }, () => this.executeSearch(true));
  }

  setUnion(a: any, b: any) {
    return new Set([...a, ...b])
  }

  /**
   * Handler for selecting and applying filters immediately
   * @param category the category of filter to update (e.g. Culture, Department)
   * @param value the specific filter to toggle (e.g. French, Sculputres)
   */
  selectAndApplyFilters(category: any, value: any) {
    let af = this.state.activeFilters;

    // Adds the new category to active filters if it does not exist
    if (!Object.keys(af).includes(category)) {
      af[category] = new Set();
    }

    // Toggles the active status of the filter
    if (af[category].has(value)) {
      af[category].delete(value);
    }
    else {
      af[category].add(value);
    }

    // Update the state and search with the new active filters
    this.setState({ activeFilters: af }, () => this.executeSearch(false));
  }


  /**
   * Handles event tracking for interactions
   * @param eventName Name of the event to send to appInsights
   * @param properties Custom properties to include in the event data
   */
  async handleTrackEvent(eventName: string, properties: Object) {
    appInsights.trackEvent({ name: eventName, properties: properties });
  }

  render() {
    return (
      <Stack className="search__topstack">
        <SearchControl updateTerms={this.updateTerms} />
        <Separator />
        <Stack horizontal>
          <Stack>
            <TagList
              activeFilters={this.state.activeFilters}
              facets={this.state.facets}
              selectAndApplyFilters={this.selectAndApplyFilters}
              clearActiveFilters={this.clearActiveFilters}
            />
          </Stack>
          <Separator vertical />
          <SearchGrid results={this.state.results} handleTrackEvent={this.handleTrackEvent} />
        </Stack>

      </Stack>
    )
  }
}

export default SearchPage