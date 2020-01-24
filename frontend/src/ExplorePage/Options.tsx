// import '../main.scss';
import React from 'react';
import { Text, Stack, Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react';
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

// const dropdownStyles: Partial<IDropdownStyles> = {
//   dropdown: { width:300 }
// }

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

// Options for filtering the museum
const museumOptions: IDropdownOption[] = [
  { key: 'museumAll', text: 'All Museums'},
  { key: 'museumMet', text: 'Metropolitan Museum of Art'},
  { key: 'museumRijks', text: 'Rijksmuseum'}
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
      },
      museum: {
        callback: this.handleChange,
        options: ['All', 'Metropolitan Museum of Art', 'Rijksmuseum']
      }
    };

    for (let category in Object.keys(selectors)) {
      if (Object.prototype.hasOwnProperty.call(selectors, category)) {
        dropdowns.push(
          <Dropdown
              placeholder={"Select " + category}
              label={category}
              options={cultureOptions}
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
      <Stack>
        <Text style={{"textAlign":"center", "fontWeight":"bold"}} variant="xLarge">Artwork Qualities</Text>
        <Stack horizontal className="explore__options-container" horizontalAlign="center" wrap>
          <Stack.Item className="explore__dropdown">
            <Dropdown
              placeholder={"Select Culture"}
              label={"Culture"}
              options={cultureOptions}
              responsiveMode={ResponsiveMode.large}
              onChange={( event:any, option:any ) => this.props.callback("Culture", option)}
            />
          </Stack.Item>
          <Stack.Item className="explore__dropdown">
            <Dropdown
              placeholder={"Select Medium"}
              label={"Medium"}
              options={mediumOptions}
              responsiveMode={ResponsiveMode.large}
              onChange={( event:any, option:any ) => this.props.callback("Medium", option)}
            />
          </Stack.Item>
          <Stack.Item className="explore__dropdown">
            <Dropdown
              placeholder={"Select Museum"}
              label={"Museum"}
              options={mediumOptions}
              responsiveMode={ResponsiveMode.large}
            />
          </Stack.Item>
        </Stack>
      </Stack>
    );
  }
}

export default Options