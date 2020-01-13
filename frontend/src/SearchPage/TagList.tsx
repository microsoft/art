import React, { Component, ChangeEvent } from 'react';
import { DefaultButton, mergeStyles } from 'office-ui-fabric-react';

interface IProps {
    activeFilters:any,
    facets:any,
    clearActiveFilters:any,
    selectAndApplyFilters:any
}

const buttonStyle = mergeStyles({

})

/**
 * List of tags that can be used to filter results
 */
export default class TagList extends Component<IProps> {
  constructor(props:any) {
    super(props);
    this.state = {};
  }

  /**
   * Handles filter updates related to a checkbox change
   * @param event the triggered checkbox event
   * @param category the category of the filter to update (e.g. Culture, Department)
   * @param value the specific filter to toggle (e.g. French, Sculptures)
   */
  onCheckboxChange(event:ChangeEvent, category: any, value: any) {
    this.props.selectAndApplyFilters(category, value);
  }

  /**
   * Returns if a filter is active based on state in the parent
   * @param activeFilters object containing the current active filters
   * @param name the category of the filter to check (e.g. Culture, Department)
   * @param value the specific filter to toggle (e.g. French, Sculptures)
   */
  isChecked(activeFilters:any, name:string, value:string) {
    return activeFilters[name] != null && activeFilters[name].has(value);
  }

  render() {
    return (
      <div className="search__section">
        <DefaultButton className="search__button" text="Clear Filters" onClick={this.props.clearActiveFilters} />
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
      </div>
    );
  }
}