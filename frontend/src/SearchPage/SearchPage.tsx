import { Separator, Stack } from 'office-ui-fabric-react';
import React from 'react';
import { appInsights } from '../AppInsights';
import SearchControl from './SearchControl';
import SearchGrid from './SearchGrid';
import TagList from './TagList';

interface IProps {
  match: any
};

interface IState {
  terms: string[],                              // Current search query terms to be displayed
  searchFields: any,
  activeFilters: { [key: string]: Set<string> },    // Active tags used for filtering the search results
  facets: { [key: string]: string[] },              // Available filtering tags for the current search terms (currently top 5 most common tags)
  results: object[]                             // Search results
};

const facetNames = ["Culture"];

// const azureSearchUrl =
//   'https://met-search.search.windows.net/indexes/met-index/docs?api-version=2019-05-06&';
// const apiKey = 'E05256A72E0904582D2B7671DD7E2E3E';

const azureSearchUrl =
  'https://extern-search.search.windows.net/indexes/merged-art-search-3/docs?api-version=2019-05-06';
const apiKey = '0E8FACE23652EB8A6634F02B43D42E55';

export class SearchPage extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      terms: ['*'], // Current search query to be displayed
      searchFields: null,
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

  /**
   * Execute a search with no terms on startup
   */
  // componentDidMount() {
  //   const id = this.props.match.params.id; // The ID and museum of the given artwork

  //   if (id) {
  //     let realID = null;
  //     let realMuseum = null;
  //     if (id != null) {
  //       realID = id.split("&")[0].slice(3);
  //       realMuseum = id.split("&")[1];
  //       if (realMuseum) {
  //         realMuseum = realMuseum.slice(7);
  //       }
  //     }

  //     let query = "&search=" + realID + "&filter=" + realMuseum;
  //     console.log(query);
  //     let self = this;
  //     //Make query
  //     fetch(azureSearchUrl + query, { headers: { "Content-Type": "application/json", 'api-key': apiKey, } })
  //       .then(function (response) {
  //         return response.json();
  //       })
  //       .then(function (responseJson) {
  //         let currImgObj = responseJson.value[0];

  //         self.makeAPIquery(currImgObj.Thumbnail_Url);
  //       });
        
  //   } else {
  //     this.setState({ terms: ["*"] }, () => this.executeSearch(true))
  //   }
  // }

  componentDidMount() {
    const id = this.props.match.params.id; // The ID and museum of the given artwork

    if (id) {
      let decodedId = decodeURIComponent(id);

      let queryString = decodedId.split("&")[0].slice(7);
      this.setState({terms:[queryString]},() => this.executeSearch(true));  
    } else {
      this.setState({ terms: ["*"] }, () => this.executeSearch(true))
    }
  }




  filterTerm(col: any, values: any) {
    return `search.in(${col},  '${[...values].join("|")}', '|')`
  }

  /**
     * Queries API with the original artwork with conditional qualities
     * @param originalArtURL the image url of the original artwork
     * @param conditionals the conditional qualities to apply to the query
     */
  makeAPIquery(originalArtURL: string, conditionals?: any) {
    const apiURL = "https://extern2020apim.azure-api.net/cknn/";;
    // let params = '?url=' + originalArtURL + '&numResults=' + '9';
    let params = '?url=' + originalArtURL + '&n=' + '10';


    const Http = new XMLHttpRequest();
    Http.open('POST', apiURL);

    let queryJson = {
      url: originalArtURL,
      n: 20
    }

    Http.send(JSON.stringify(queryJson));
    Http.onreadystatechange = e => {
      if (Http.readyState === 4) {
        try {
          let response = JSON.parse(Http.responseText);
          response = response.results;
          const mappedData = response.map((pair:any) => pair[0])

          this.setState({
            results: mappedData
          });

        } catch (e) {
          console.log('malformed request:' + Http.responseText);
        }
      }
    }
  }

  /**
   * This function creates a brand new search query request and refreshes all tags and results in the current state
   * @param updateFacets whether to retrieve new filter tags after the search (e.g. French, Sculptures)
   */
  executeSearch(updateFacets: boolean): void {
    let query = "&search=" + this.state.terms.join('|')
    //let query="&search=";

    if (this.state.searchFields != null) {
      query = query + "&searchFields=" + this.state.searchFields.join(",")
    }
    query = query + facetNames.map(f => "&facet=" + f + "%2Ccount%3A8").join("")

    let filtersToSearch = Object.entries(this.state.activeFilters)
      .filter((val: any) =>
        val[1].size > 0
      )

    if (filtersToSearch.length !== 0) {
      query = query + "&$filter=" + filtersToSearch.map(([col, values], ) =>
        this.filterTerm(col, values)
      ).join(" or ")
    }

    console.log(query)
    let self = this
    fetch(azureSearchUrl + query, { headers: { "Content-Type": "application/json", 'api-key': apiKey, } })
      .then(function (response) {
        return response.json();
      })
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
    this.setState({ terms: newTerms, searchFields: null }, () => this.executeSearch(true));
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
    console.log("Tracked " + eventName);
    appInsights.trackEvent({ name: eventName, properties: properties });
  }

  // render() {
  //     return (
  //         <Stack className={topStackClass}>
  //             <SearchControl updateTerms={this.updateTerms} />
  //             <Separator />
  //             <Stack horizontal>
  //                 <Stack grow={1}>
  //                     <TagList
  //                     activeFilters={this.state.activeFilters}
  //                     facets={this.state.facets}
  //                     selectAndApplyFilters={this.selectAndApplyFilters}
  //                     clearActiveFilters={this.clearActiveFilters}
  //                     />
  //                 </Stack>
  //                 <Separator vertical />
  //                 <Stack horizontal wrap grow={2}>
  //                     <SearchGrid results={this.state.results} />
  //                 </Stack>
  //             </Stack>

  //         </Stack>
  //     )
  // }

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