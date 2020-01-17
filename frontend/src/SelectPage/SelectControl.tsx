import React, { Component } from 'react';
import {Dropdown, IDropdownOption, IDropdownStyles} from 'office-ui-fabric-react';

interface IProps {
    curatedImages: any,
    clearOldImages: any,
    sendObjectIds: any
};

interface IState {
    options: any,
}

//const NUM_IMAGES_SEARCH_PAGE = 12;
const NUM_FOR_SELECT = 1;

const dropdownOptions: IDropdownOption[] = [
    { key: 'optionAll', text: 'All' },
    { key: 'optionAmerican', text: 'American' },
    { key: 'optionFrench', text: 'French' },
    { key: 'optionGerman', text: 'German' },
    { key: 'optionItalian', text: 'Italian' },
]

const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { 
        width: 300
    }
};

/**
 * The search bar for art tags
 * 'curatedImages' prop: object of objIDs
 * 'clearOldImages' prop: callback to clear out old images
 * 'snedObjectIds' prop: callback to send the Object IDs to the parent
 */
export default class SearchControl extends Component<IProps, IState> {
  state = {
    options: dropdownOptions,
  };

  /**
   * choses N random unique elements from list and returns them in a list
   * @param {any[]} list - list of elements of any type
   * @param {*} n - the number of unqiue elements to choose. N <= list.length
   */
  pickNUniqueFromList(list:any, n:any) {
    if (list && n > list.length) {
      return 'N IS TOO LARGE';
    }

    let output: any[] = [];
    while (list && output && output.length < n) {
      let randIndex = Math.floor(Math.random() * list.length);
      let choice = list[randIndex];
      if (!output.includes(choice)) {
        output.push(choice);
      }
    }
    return output;
  }

  /**
   * Picks images from the category and sends them to the SelectPage for display
   * @param {String} category
   */
  onSelection(category: any) {
    // this.setState({
    //   selectedValue: category,
    // });
    // TODO: Review
    // if (this.selectedValue === 'All') {
    //   this.setState({
    //     selectedValue: null,
    //   });
    // } else {
    //   this.setState({
    //     selectedValue: category,
    //   });
    // }

    let curatedImages = this.props.curatedImages;
    console.log(curatedImages);
    console.log(category);
    let IDs = this.pickNUniqueFromList(curatedImages[category], NUM_FOR_SELECT);
    console.log("IDS:");
    console.log(IDs);
    this.props.clearOldImages();
    this.props.sendObjectIds(IDs);
  }

  render() {
    const { options } = this.state;
    return (
      <Dropdown
        placeholder="Select a Category"
        options={options}
        onChange={( event:any, option:any ) => this.onSelection(option["text"])}
        styles={dropdownStyles}
      />
    );
  }
}