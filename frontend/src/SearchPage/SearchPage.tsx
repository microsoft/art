import React from 'react';
import { Stack, Separator } from 'office-ui-fabric-react';
import SearchControl from './SearchControl';
import TagList from './TagList';
import SearchGrid from './SearchGrid';
import { appInsights } from '../AppInsights';

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

const dummyList = [
  {
      "@search.score": 1.7071549,
      "id": "UlAtUC0yMDE2LTY2LTc=",
      "Title": "Tiger",
      "Artist": "Utagawa Kunimaro (I)",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-P-2016-66-7.jpg",
      "Image_Url": "https://lh3.googleusercontent.com/234_CajwnCl4yeStsWfauXj62B-aCjq6LPpGMJggjZLUnWXvnMQtfsVRld4ywCkltXvv1yFb3JH2Jfy3Iv2Rm5uM-A=s0",
      "Culture": "japanese",
      "Classification": "prints",
      "Museum_Page": "https://www.rijksmuseum.nl/en/collection/RP-P-2016-66-7",
      "Museum": "rijks",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 1.706183,
      "id": "MzMzOTE5",
      "Title": "Tiger",
      "Artist": "Antoine-Louis Barye",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/333919.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/dp/original/DP805134.jpg",
      "Culture": "french",
      "Classification": "drawings",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/333919",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 1.6548584,
      "id": "QUstUkFLLTIwMTUtMi01",
      "Title": "Tiger",
      "Artist": "Kôno Bairei",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/AK-RAK-2015-2-5.jpg",
      "Image_Url": "https://lh3.googleusercontent.com/pLPKdX0cALLwfQ1enrvJEiBeRbt92TFWc5OWYvmwtKHkRFr1W2-T5nvRVqz4oJfcFs-liC4ThYCohTl0aEeBFQ0BJkQ=s0",
      "Culture": "japanese",
      "Classification": "uncategorized",
      "Museum_Page": "https://www.rijksmuseum.nl/en/collection/AK-RAK-2015-2-5",
      "Museum": "rijks",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 1.609758,
      "id": "MjA0NDE4",
      "Title": "Tiger",
      "Artist": "Mary Atwood",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/204418.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/es/original/DP22308.jpg",
      "Culture": "british",
      "Classification": "ceramics",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/204418",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 1.5362998,
      "id": "MzMzOTIw",
      "Title": "Tiger",
      "Artist": "Antoine-Louis Barye",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/333920.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/dp/original/DP805133.jpg",
      "Culture": "french",
      "Classification": "drawings",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/333920",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 1.0669718,
      "id": "UlAtRi0yMDAxLTctNDAzQS0y",
      "Title": "A tiger",
      "Artist": "J. Fortuné Nott",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/rijks/resized_images/RP-F-2001-7-403A-2.jpg",
      "Image_Url": "https://lh3.googleusercontent.com/6k36a5kO6YVi4w4z8yFfqNNOA1vV0SrJyWi6PeOPLOY2uX_HJ9oh8kNtIdtZVfhZl869zoAgVKFPjtfV1zQ4KkKZxXpY=s0",
      "Culture": "french",
      "Classification": "uncategorized",
      "Museum_Page": "https://www.rijksmuseum.nl/en/collection/RP-F-2001-7-403A-2",
      "Museum": "rijks",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 1.0663643,
      "id": "MzI1NjA0",
      "Title": "Tiger (?) figurine",
      "Artist": null,
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/325604.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/an/original/ME63_102_20.jpg",
      "Culture": "iranian",
      "Classification": "ceramics",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/325604",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 1.0060987,
      "id": "MzM0MzA0",
      "Title": "Royal Tiger",
      "Artist": "Antoine-Louis Barye",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/334304.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/dp/original/DP805152.jpg",
      "Culture": "french",
      "Classification": "drawings",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/334304",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 1.0060987,
      "id": "MzM2NTI5",
      "Title": "Crouching Tiger",
      "Artist": "Eugène Delacroix",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/336529.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/dp/original/DP836040.jpg",
      "Culture": "french",
      "Classification": "drawings",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/336529",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 0.9601874,
      "id": "MTk4Mzg5",
      "Title": "Snarling Tiger",
      "Artist": "Antoine-Louis Barye",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/198389.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/es/original/118188.jpg",
      "Culture": "french",
      "Classification": "sculptures",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/198389",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 0.8537041,
      "id": "MzMzODg1",
      "Title": "Tiger Stalking Prey",
      "Artist": "Antoine-Louis Barye",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/333885.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/dp/original/DP805139.jpg",
      "Culture": "french",
      "Classification": "drawings",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/333885",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 0.8530915,
      "id": "MzYwNzI2",
      "Title": "Cupid on a tiger",
      "Artist": "Wenceslaus Hollar|Giulio Romano",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/360726.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/dp/original/DP822896.jpg",
      "Culture": "ancient european",
      "Classification": "prints",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/360726",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 0.8274292,
      "id": "MzMzOTMy",
      "Title": "Tiger in Landscape",
      "Artist": "Antoine-Louis Barye",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/333932.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/dp/original/DP805142.jpg",
      "Culture": "french",
      "Classification": "drawings",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/333932",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 0.8267159,
      "id": "MTkxMTI1",
      "Title": "Tiger attacking an antelope",
      "Artist": "Antoine-Louis Barye",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/191125.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/es/original/6048.jpg",
      "Culture": "french",
      "Classification": "sculptures",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/191125",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 0.8043792,
      "id": "Njc4MDEz",
      "Title": "Tiger in Repose",
      "Artist": "Antoine-Louis Barye",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/678013.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/ep/original/DP348637.jpg",
      "Culture": "various",
      "Classification": "paintings",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/678013",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  },
  {
      "@search.score": 0.784704,
      "id": "MzMzOTQw",
      "Title": "Tiger Approaching Pool",
      "Artist": "Antoine-Louis Barye",
      "Thumbnail_Url": "https://mmlsparkdemo.blob.core.windows.net/met/thumbnails/333940.jpg",
      "Image_Url": "https://images.metmuseum.org/CRDImages/dp/original/DP805157.jpg",
      "Culture": "french",
      "Classification": "drawings",
      "Museum_Page": "http://www.metmuseum.org/art/collection/search/333940",
      "Museum": "met",
      "requestId": null,
      "categories": [],
      "adult": null,
      "tags": [],
      "description": null,
      "metadata": null,
      "faces": [],
      "color": null,
      "imageType": null,
      "brands": [],
      "objects": []
  }];

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
    componentDidMount() {
      const id = this.props.match.params.id; // The IDs of the images found by NN

      if (id) {
        let realID = null;
        let realMuseum = null;
        if (id != null) {
          realID = id.split("&")[0].slice(3);
          realMuseum = id.split("&")[1];
          if (realMuseum) {
            realMuseum = realMuseum.slice(7);
          }
        }

        //do ball tree shit here
        this.setState({results:dummyList});
      } else {
        this.setState({terms:["*"]}, () => this.executeSearch(true))
      }
    }

  filterTerm(col: any, values: any) {
    return `search.in(${col},  '${[...values].join("|")}', '|')`
  }


    
    /**
     * This function creates a brand new search query request and refreshes all tags and results in the current state
     * @param updateFacets whether to retrieve new filter tags after the search (e.g. French, Sculptures)
     */
    executeSearch(updateFacets:boolean):void {
        let query= "&search="+this.state.terms.join('|')
        //let query="&search=";
    
        if (this.state.searchFields!=null){
          query = query+ "&searchFields=" + this.state.searchFields.join(",")
        }
        query = query+facetNames.map(f => "&facet="+f+"%2Ccount%3A8").join("")
        
        let filtersToSearch = Object.entries(this.state.activeFilters)
          .filter( (val:any) => 
            val[1].size > 0
          )
    
        if (filtersToSearch.length !== 0){
          query = query + "&$filter=" +  filtersToSearch.map( ([col, values],) =>
              this.filterTerm(col, values)
            ).join(" or ")
        }
    
        console.log(query)
        let self = this
        fetch(azureSearchUrl + query, { headers: {"Content-Type": "application/json", 'api-key': apiKey,  } })
          .then(function(response) {            
            return response.json();
          })
          .then(function(responseJson) {

            if (updateFacets) {
              self.setState({facets:responseJson["@search.facets"], results:responseJson.value});
            }
            else {
              self.setState({results:responseJson.value});
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
    this.setState({activeFilters: af}, ()=>this.executeSearch(false));
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
          <SearchGrid results={this.state.results} handleTrackEvent={this.handleTrackEvent}/>
        </Stack>

      </Stack>
    )
  }
}

export default SearchPage