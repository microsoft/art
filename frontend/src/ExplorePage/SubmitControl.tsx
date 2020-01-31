import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

interface IProps{
};

interface IState {
    value: any,
    shouldRedirect: any,
    searchLink: any
}

export default class SubmitControl extends Component<IProps, IState> {
  constructor(props:any) {
    super(props);
    this.state = {
      value: '',
      shouldRedirect: false,
      searchLink: ''
    };
  }

  onChange = (event:any) => {
    this.setState({ value: event.target.value });
  };

  onSubmit = (event:any) => {
    event.preventDefault();
    let  searchLink = this.getSearchUrl(this.state.value)
    this.setState({shouldRedirect:true, searchLink:searchLink});
  }

  getSearchUrl(searchString : string) {
    let urlBase = '/search/';

    let queryURL = '?query=' + searchString;
    let url = encodeURIComponent(queryURL);
    return urlBase + url;
  }

  render() {
    const { value } = this.state.value;
    if (this.state.shouldRedirect) {
      return <Redirect push to={this.state.searchLink} />;

    } else {
      return(
        <form onSubmit={this.onSubmit}>
          <input className="search__input" style={{backgroundColor:"#f0f0f0", marginBottom:"10px", width: "min(95%, 1100px)", height: "60px", position: "relative", left: "50%", transform: "translate(-50%, 0%)"}} type="search" value={value} placeholder="Search" onChange={this.onChange} />
          <input type="submit" style={{display:"none"}} />
        </form>

      ) 
    }
  }
}