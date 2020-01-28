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
  { key: 'culture1', text: 'african (general)' },
  { key: 'culture2', text: 'american' },
  { key: 'culture3', text: 'ancient american' },
  { key: 'culture4', text: 'ancient asian' },
  { key: 'culture5', text: 'ancient european' },
  { key: 'culture6', text: 'ancient middle-eastern' },
  { key: 'culture7', text: 'asian (general)' },
  { key: 'culture8', text: 'austrian' },
  { key: 'culture9', text: 'belgian' },
  { key: 'culture10', text: 'british' },
  { key: 'culture11', text: 'chinese' },
  { key: 'culture12', text: 'czech' },
  { key: 'culture13', text: 'dutch' },
  { key: 'culture14', text: 'egyptian' },
  { key: 'culture15', text: 'european (general)' },
  { key: 'culture16', text: 'french' },
  { key: 'culture17', text: 'german' },
  { key: 'culture18', text: 'greek' },
  { key: 'culture19', text: 'iranian' },
  { key: 'culture20', text: 'italian' },
  { key: 'culture21', text: 'japanese' },
  { key: 'culture22', text: 'latin american' },
  { key: 'culture23', text: 'middle eastern' },
  { key: 'culture24', text: 'roman' },
  { key: 'culture25', text: 'russian' },
  { key: 'culture26', text: 'south asian' },
  { key: 'culture27', text: 'southeast asian' },
  { key: 'culture28', text: 'spanish' },
  { key: 'culture29', text: 'swiss' },
  { key: 'various', text: 'various' }
];

// Options for filtering the art medium
const mediumOptions: IDropdownOption[] = [
  { key: 'medium1', text: 'prints'},
  { key: 'medium2', text: 'drawings'},
  { key: 'medium3', text: 'ceramics'},
  { key: 'medium4', text: 'textiles'},
  { key: 'medium5', text: 'paintings'},
  { key: 'medium6', text: 'accessories'},
  { key: 'medium7', text: 'photographs'},
  { key: 'medium8', text: 'glass'},
  { key: 'medium9', text: 'metalwork'},
  { key: 'medium10', text: 'sculptures'},
  { key: 'medium11', text: 'weapons'},
  { key: 'medium12', text: 'stone'},
  { key: 'medium13', text: 'precious'},
  { key: 'medium14', text: 'paper'},
  { key: 'medium15', text: 'woodwork'},
  { key: 'medium16', text: 'leatherwork'},
  { key: 'medium17', text: 'musical instruments'},
  { key: 'medium18', text: 'uncategorized'}
];

// Options for filtering the art culture
// const cultureOptions: IDropdownOption[] = [
//     { key: 'cultureChinese', text: 'chinese' },
//     { key: 'cultureAmerican', text: 'american' },
//     { key: 'cultureBritish', text: 'british' },
//     { key: 'cultureKorean', text: 'korean' }
// ];

// Options for filtering the art medium
// const mediumOptions: IDropdownOption[] = [
//     { key: 'mediumPainting', text: 'Painting'},
//     { key: 'mediumSculpture', text: 'Sculpture'},
//     { key: 'mediumPottery', text: 'Pottery'},
//     { key: 'mediumArmor', text: 'Armor'}
// ];

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
        options: ['chinese', 'american', 'british', 'korean']
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
              onChange={( event:any, option:any ) => this.props.callback("culture", option)}
            />
          </Stack.Item>
          <Stack.Item className="explore__dropdown">
            <Dropdown
              placeholder={"Select Medium"}
              label={"Medium"}
              options={mediumOptions}
              responsiveMode={ResponsiveMode.large}
              onChange={( event:any, option:any ) => this.props.callback("medium", option)}
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