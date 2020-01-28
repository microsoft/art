import React from 'react';
import { Text, Stack, Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react';
import { mergeStyles } from '@uifabric/merge-styles';
import Select from '@material-ui/core/Select';
import { Input, FormControl, InputLabel, makeStyles } from '@material-ui/core';

const dropdown = mergeStyles({
  marginBottom: 10
});

interface IState { };

// Expected props
interface IProps {
  // Functions for updating state in parent when changing filters
  changeConditional : any
}

interface IState { };

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
  { key: 'culture30', text: 'various' }
];

// Options for filtering the art medium
const mediumOptions: IDropdownOption[] = [
  { key: 'medium1', text: 'prints' },
  { key: 'medium2', text: 'drawings' },
  { key: 'medium3', text: 'ceramics' },
  { key: 'medium4', text: 'textiles' },
  { key: 'medium5', text: 'paintings' },
  { key: 'medium6', text: 'accessories' },
  { key: 'medium7', text: 'photographs' },
  { key: 'medium8', text: 'glass' },
  { key: 'medium9', text: 'metalwork' },
  { key: 'medium10', text: 'sculptures' },
  { key: 'medium11', text: 'weapons' },
  { key: 'medium12', text: 'stone' },
  { key: 'medium13', text: 'precious' },
  { key: 'medium14', text: 'paper' },
  { key: 'medium15', text: 'woodwork' },
  { key: 'medium16', text: 'leatherwork' },
  { key: 'medium17', text: 'musical instruments' },
  { key: 'medium18', text: 'uncategorized' }
];

// Options for filtering the museum
const museumOptions: IDropdownOption[] = [
  { key: 'museumAll', text: 'All Museums' },
  { key: 'museumMet', text: 'Metropolitan Museum of Art' },
  { key: 'museumRijks', text: 'Rijksmuseum' }
];

const useStyles = makeStyles({
  root: {
    width: "212px",
    height: "39px",
    border: "2px solid black",
    textTransform: "capitalize",
    fontSize: "1rem",
    paddingLeft: "10px",
    outline: "none"
  },
  select: {

  }
});

interface IProps {
  changeConditional : any
}

// class Options extends React.Component<IProps, IState> {

export default function Options(props: IProps) {

  const classes = useStyles();

  // Debugging purposes, unnecessary
  const handleChange = (event: React.FormEvent < HTMLDivElement >, option ?: IDropdownOption): void => {
    console.log(option)
  }

  return (
    <FormControl>
      {/* <InputLabel>Quality</InputLabel> */}
      <Select
        native
        defaultValue=""
        onChange={(event) => {props.changeConditional("culture", event.target.value)}}
        classes={{
          root: classes.root
        }}>
        <option value="" />
        <optgroup label="Culture">
          {cultureOptions.map(culture => (<option value={culture.text}>{culture.text}</option>))}
        </optgroup>
        <optgroup label="Medium">
          {mediumOptions.map(medium => (<option value={medium.text}>{medium.text}</option>))}
        </optgroup>
      </Select>
    </FormControl>
  );
  // return (
  //   <Stack>
  //     <Text style={{ "textAlign": "center", "fontWeight": "bold" }} variant="xLarge">Artwork Qualities</Text>
  //     <Stack horizontal className="explore__options-container" horizontalAlign="center" wrap>
  //       <Stack.Item className="explore__dropdown">
  //         <Dropdown
  //           placeholder={"Select Culture"}
  //           label={"Culture"}
  //           options={cultureOptions}
  //           responsiveMode={ResponsiveMode.large}
  //           onChange={(event: any, option: any) => this.props.callback("culture", option)}
  //         />
  //       </Stack.Item>
  //       <Stack.Item className="explore__dropdown">
  //         <Dropdown
  //           placeholder={"Select Medium"}
  //           label={"Medium"}
  //           options={mediumOptions}
  //           responsiveMode={ResponsiveMode.large}
  //           onChange={(event: any, option: any) => this.props.callback("medium", option)}
  //         />
  //       </Stack.Item>
  //       <Stack.Item className="explore__dropdown">
  //         <Dropdown
  //           placeholder={"Select Museum"}
  //           label={"Museum"}
  //           options={mediumOptions}
  //           responsiveMode={ResponsiveMode.large}
  //         />
  //       </Stack.Item>
  //     </Stack>
  //   </Stack>
  // );
}