import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

interface IProps {
  placeholder: string
};

interface IState {
  value: any,
  shouldRedirect: any,
  searchLink: any
}
/**
 * The Search Bar at the top of the Explore Page
 */
export default class SubmitControl extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      value: '',
      shouldRedirect: false,
      searchLink: ''
    };
  }

  onChange = (event: any) => {
    this.setState({ value: event.target.value });
  };

  /**
   * OnSubmit event to instruct the component to redirect
   * to the Search Page with the generated URL
   */
  onSubmit = (event: any) => {
    event.preventDefault();
    let searchLink = this.getSearchUrl(this.state.value)
    this.setState({ shouldRedirect: true, searchLink: searchLink });
  }

  /**
   * Generates the search page url with the search query parameter
   * @param searchString The string in the search bar to be used to make the search query
   */
  getSearchUrl(searchString: string) {
    let urlBase = '/search/';

    let queryURL = '?query=' + searchString;
    let url = encodeURIComponent(queryURL);
    return urlBase + url;
  }

  render() {
    const { value } = this.state.value;
    if (this.state.shouldRedirect) {
      //Redirects to the search page using the url generated in getSearchUrl()
      return <Redirect push to={this.state.searchLink} />;

    } else {
      return (
        <form onSubmit={this.onSubmit} style={{flexGrow:1}}>
          <input className="search__input" style={{
            backgroundColor: "#f0f0f0",
            width: "95%",
            height: "60px",
            margin: "20px",
          }} type="search" value={value} placeholder={this.props.placeholder} onChange={this.onChange} />
          <input type="submit" style={{ display: "none" }} />
        </form>

      )
    }
  }
}