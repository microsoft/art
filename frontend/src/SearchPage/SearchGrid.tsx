import React, { Component } from 'react';
import ResultBox from './ResultBox';

interface IProps{
    results: any
};

/**
 * Grid used to display results of a search
 * 'results' prop: an array of the json results from the Azure search (the 'value' value)
 */
export default class SearchGrid extends Component<IProps> {
  render() {
    return (
      <React.Fragment>
        {this.props.results.map( (result:any) => (
          <ResultBox key={result.Object_ID} data={result} />
        ))}
      </React.Fragment>
    );
  }
}