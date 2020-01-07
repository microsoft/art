import React from 'react';
import { Stack, Dropdown, IDropdownOption, IDropdownStyles} from 'office-ui-fabric-react';
import { mergeStyles } from '@uifabric/merge-styles';

const dropdown = mergeStyles({
    marginBottom : 10
});

// Expected props
interface IProps {
  // Potentially pass in a object of the selector options from parent (culture, medium, etc)?
  options? : Object,
  // Functions for updating state in parent when changing filters
  handleCultureChange? : (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => void,
  handleMediumChange? : (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => void
}

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width:300 }
}

// Options for filtering the art culture
const cultureOptions: IDropdownOption[] = [
    { key: 'cultureChinese', text: 'Chinese' },
    { key: 'cultureAmerican', text: 'American' },
    { key: 'cultureBritish', text: 'British' },
    { key: 'cultureKorean', text: 'Korean' }
];

// Options for filtering the art medium
const mediumOptions: IDropdownOption[] = [
    { key: 'mediumPainting', text: 'Painting'},
    { key: 'mediumSculpture', text: 'Sculpture'},
    { key: 'mediumPottery', text: 'Pottery'},
    { key: 'mediumArmor', text: 'Armor'}
];

class Options extends React.Component<IProps, IState> {

  // Debugging purposes, unnecessary
  private handleChange(event : React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void {
    console.log(option)
  }

  // TODO: Planned on building up a set of dropdowns inputs in case we need
  // to easily add more options besides culture and medium
  private createDropdowns(): JSX.Element[] {
    let dropdowns: JSX.Element[] = [];

    let selectors: Object = {
      culture: {
        callback: this.handleChange,
        options: ['Chinese', 'American', 'British', 'Korean']
      },
      medium: {
        callback: this.handleChange,
        options: ['Painting', 'Sculpture', 'Pottery', 'Armor']
      }
    };

    for (let category in Object.keys(selectors)) {
      if (Object.prototype.hasOwnProperty.call(selectors, category)) {
        dropdowns.push(
          <Dropdown
              placeholder={"Select " + category}
              label={category}
              options={cultureOptions}
              styles={dropdownStyles}
              className={dropdown}
              onChange={this.props.handleCultureChange}
            />
        )
      }
    }

    return dropdowns;
  }

  render() {
    return(
      <Stack>
        <Stack.Item align="center">
          <Dropdown
            placeholder={"Select Culture"}
            label={"Culture"}
            options={cultureOptions}
            styles={dropdownStyles}
            className={dropdown}
            onChange={this.props.handleCultureChange}
          />
          <Dropdown
            placeholder={"Select Medium"}
            label={"Medium"}
            options={mediumOptions}
            styles={dropdownStyles}
            className={dropdown}
            onChange={this.props.handleMediumChange}
          />
        </Stack.Item>
      </Stack>
    );
  }
}

export default Options