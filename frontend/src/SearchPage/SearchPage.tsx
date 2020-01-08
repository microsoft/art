import React from 'react';
import {Stack, Separator, mergeStyles} from 'office-ui-fabric-react';
import SearchControl from './SearchControl';
import TagList from './TagList';
import SearchGrid from './SearchGrid';

interface IProps {};

interface IState {
    terms: any, // Current search query to be displayed
    searchFields: any,
    selectedFilters: any,
    activeFilters: any,
    facets: any,
    results: any
};

const topStackClass = mergeStyles({
    marginLeft: 40,
    marginRight: 40
})

const facetNames = ["Culture","Department"];
const azureSearchUrl =
  'https://met-search.search.windows.net/indexes/met-index/docs?api-version=2019-05-06&';
const apiKey = 'E05256A72E0904582D2B7671DD7E2E3E';


export class SearchPage extends React.Component<IProps, IState> {

    constructor(props:any) {
        super(props);
        this.state = {
          terms: ['*'], // Current search query to be displayed
          searchFields: null,
          selectedFilters: {},
          activeFilters: {},
          facets: {},
          results: []
        };
        this.updateTerms = this.updateTerms.bind(this);
        this.clearActiveFilters = this.clearActiveFilters.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.applySelectedFilters = this.applySelectedFilters.bind(this);
    
        //AppInsights.downloadAndSetup({ instrumentationKey: "7ca0d69b-9656-4f4f-821a-fb1d81338282" });
        //AppInsights.trackPageView("Search Page");
    }

    filterTerm(col:any, values:any) {
        return `search.in(${col},  '${[...values].join("|")}', '|')`
    }
    
    /**
     * This function creates a brand new search query request and refreshes all tags and results in the current state
     * @param query the new search query
     */
    executeSearch():any {
        let query= "&search="+this.state.terms.join('|')
    
        if (this.state.searchFields!=null){
          query = query+ "&searchFields=" + this.state.searchFields.join(",")
        }
        query = query+facetNames.map(f => "&facet="+f+",count:5").join("")
        
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
        fetch(azureSearchUrl + query, { headers: { 'api-key': apiKey } })
          .then(function(response) {
            return response.json();
          })
          .then(function(responseJson) {
            self.setState({facets:responseJson["@search.facets"], results:responseJson.value})
          });
    }
    
    componentDidMount() {

        this.setState({terms:["*"]}, this.executeSearch)

        //const ids = this.props.match.params.id; // The IDs of the images found by NN
        //if (ids != null) {
        //    this.setState({terms:this.uriToJSON(ids), searchFields:["Object_ID"]}, this.executeSearch)
        //} else {
        //    this.setState({terms:["*"]}, this.executeSearch)
        //}
    }
    
    uriToJSON(urijson:any) { return JSON.parse(decodeURIComponent(urijson)); }
    
    updateTerms(newTerms:any) {
        this.setState({terms: newTerms, searchFields:null}, this.executeSearch)
    }
    
    clearActiveFilters() {
        this.setState({activeFilters: {}}, this.executeSearch)
    }
      
    toggleFilter(col:any, value:any) {
        let oldFilters = this.state.selectedFilters
        if (oldFilters[col] == null){
          oldFilters[col] = new Set()
        }
        if (oldFilters[col].has(value)){
          oldFilters[col].delete(value)
          if (oldFilters[col].size === 0){
            delete oldFilters[col]
          }
        }else{
          oldFilters[col].add(value)
        }
        this.setState({selectedFilters: oldFilters})
    
    }
    
    setUnion(a:any, b:any){
        return new Set([...a, ...b])
    }
    
    applySelectedFilters(){
        let af = this.state.activeFilters
        let sf = this.state.selectedFilters
        Object.entries(sf).forEach(([filter, values],) => {
          if (!Object.keys(af).includes(filter)) {
            af[filter] = []
          }
          af[filter] = this.setUnion(af[filter], values)
        })
        this.setState({activeFilters: af, selectedFilters: {}}, this.executeSearch())
    }
    
    render() {
        return (
            <Stack className={topStackClass}>
                <SearchControl updateTerms={this.updateTerms} />
                <Separator />
                <Stack horizontal>
                    <Stack grow={1}>
                        <TagList
                        selectedFilters={this.state.selectedFilters}
                        activeFilters={this.state.activeFilters}
                        facets={this.state.facets}
                        toggleFilter={this.toggleFilter}
                        applySelectedFilters={this.applySelectedFilters}
                        clearActiveFilters={this.clearActiveFilters}
                        />
                    </Stack>

                    <Separator vertical />
                    <Stack horizontal wrap grow={2}>
                        <SearchGrid results={this.state.results} />
                    </Stack>
                </Stack>

            </Stack>
        )
    }

}

export default SearchPage