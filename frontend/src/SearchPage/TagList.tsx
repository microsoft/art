import React, { Component, ChangeEvent } from 'react';
import { DefaultButton, mergeStyles } from 'office-ui-fabric-react';

interface IProps {
    selectedFilters:any,
    activeFilters:any,
    facets:any,
    toggleFilter:any,
    applySelectedFilters:any,
    clearActiveFilters:any,
    selectAndApplyFilters:any
}

const buttonStyle = mergeStyles({
  width: 175,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: 10,
  marginBottom: 10
})

/**
 * List of tags that can be used to filter results
 */
export default class TagList extends Component<IProps> {
  constructor(props:any) {
    super(props);
    this.state = {};
  }

  onChange = (event:any, category:any, value:any) => {
    this.props.toggleFilter(category, value);
  };

  /**
   * Handles filter updates related to a checkbox change
   * @param event the triggered checkbox event
   * @param category the category of the filter to update (e.g. Culture, Department)
   * @param value the specific filter to toggle (e.g. French, Sculptures)
   */
  onCheckboxChange(event:ChangeEvent, category: any, value: any) {
    this.props.selectAndApplyFilters(category, value);
  }

  // isChecked(selectedFilters:any, name:any, value:any) {
  //   if (selectedFilters[name] != null) {
  //     return selectedFilters[name].has(value)
  //    } else {
  //     return false
  //   }    
  // }

  isChecked(activeFilters:any, name:any, value:any) {
    // if (activeFilters[name] != null) {
    //   return activeFilters[name].has(value);
    // }
    // return false;
    
    return activeFilters[name] != null && activeFilters[name].has(value);
  }

  render() {
    return (
      <React.Fragment>
        <DefaultButton className={buttonStyle} text="Clear Active Filters" onClick={this.props.clearActiveFilters} />
        <h4 className="search__row_category">Active Filters</h4>
        {Object.entries(this.props.activeFilters).map((nameFiltervalue:any,) => 
          <React.Fragment>
            <div className="search__row_category" ><b>{nameFiltervalue[0]}</b></div> 
            {[...nameFiltervalue[1]].map(filterValue =>
                <div className="search__row" key={nameFiltervalue[0] + filterValue} >
                  <label className="search__label" htmlFor={nameFiltervalue[0] + filterValue}>{filterValue}</label>
                </div>
            )}
          </React.Fragment>
        )}
        <DefaultButton className={buttonStyle} text="Apply Selected Filters" onClick={this.props.applySelectedFilters} />
        {Object.entries(this.props.facets).map((nameFacetEntries:any,) => 
          <React.Fragment>
            <div className="search__row_category" ><b>{nameFacetEntries[0]}</b></div> 
            {nameFacetEntries[1].map((facetInfo:any) =>
              <div className="search__row" key={facetInfo.value} >
                <input 
                  className="search__checkbox"
                  type="checkbox" id={facetInfo.value}
                  checked={this.isChecked(this.props.activeFilters, nameFacetEntries[0], facetInfo.value)}
                  // onChange={e => this.onChange(e, nameFacetEntries[0], facetInfo.value)} />
                  onChange={e => this.onCheckboxChange(e, nameFacetEntries[0], facetInfo.value)} />
                <label className="search__label" htmlFor={facetInfo.value}>{facetInfo.value + ` (${facetInfo.count})`}</label>
              </div>
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}