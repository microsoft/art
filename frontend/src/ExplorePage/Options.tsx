import React from 'react';
import { Stack, Dropdown, IDropdownOption, IDropdownStyles} from 'office-ui-fabric-react';
import { mergeStyles } from '@uifabric/merge-styles';

const dropdown = mergeStyles({
    marginBottom : 10
});

interface IState {};

// Expected props
interface IProps {
  // Potentially pass in a object of the selector options from parent (culture, medium, etc)?
  options? : Object,
  // Functions for updating state in parent when changing filters
  callback : any
}

interface IState {};

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
              onChange={this.props.callback}
            />
        )
      }
    }

    return dropdowns;
  }

  render() {
    return(
      <Stack horizontal horizontalAlign="space-around" style={{width: "50%", margin: "auto"}}>
        <Stack.Item>
          <Dropdown
            placeholder={"Select Culture"}
            label={"Culture"}
            options={cultureOptions}
            styles={dropdownStyles}
            className={dropdown}
            onChange={( event:any, option:any ) => this.props.callback("Culture", option)}
          />
        </Stack.Item>
        <Stack.Item>
          <Dropdown
            placeholder={"Select Medium"}
            label={"Medium"}
            options={mediumOptions}
            styles={dropdownStyles}
            className={dropdown}
            onChange={( event:any, option:any ) => this.props.callback("Medium", option)}
          />
        </Stack.Item>
        <Stack.Item>
          <Dropdown
            placeholder={"Select Nothing"}
            label={"Nothing"}
            options={mediumOptions}
            styles={dropdownStyles}
            className={dropdown}
          />
        </Stack.Item>
      </Stack>
    );
  }
}

export default Options