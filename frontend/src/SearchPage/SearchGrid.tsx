import React, { Component } from 'react';
import { Stack } from 'office-ui-fabric-react';
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
      <Stack horizontal wrap className="search__grid">
        {this.props.results.map( (result:any) => (
          <ResultBox key={result.Object_ID} data={result} />
        ))}
      </Stack>
    );
  }
}