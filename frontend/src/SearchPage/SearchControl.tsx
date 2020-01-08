import React, { Component } from 'react';

interface IProps{
    updateTerms: any
};

interface IState {
    value: any
}

export default class SearchControl extends Component<IProps, IState> {
  constructor(props:any) {
    super(props);
    this.state = {
      value: '',
    };
  }

  onChange = (event:any) => {
    this.setState({ value: event.target.value });
    this.props.updateTerms([event.target.value]);
  };

  render() {
    const { value } = this.state.value;
    return <input className="search__input" type="search" value={value} placeholder="Search" onChange={this.onChange} />;
  }
}