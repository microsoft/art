import { FormControl, makeStyles } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import React from 'react';
import { Text } from 'office-ui-fabric-react';

const useSelectStyles = makeStyles({
  root: {
    width: "212px",
    margin: "auto",
    height: "25px",
    border: "2px solid black",
    textTransform: "capitalize",
    fontSize: "1rem",
    paddingLeft: "10px",
    outline: "none",
    fontWeight: "bold",
    fontFamily: "'Segoe UI', 'SegoeUI', -apple-system, BlinkMacSystemFont, 'Roboto', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
  },
  select: {
    outline: "none"
  }
});

interface IProps {
  value: string,
  changeConditional: any,
  choices: string[]
}

export default function Options(props: IProps) {
  const selectClasses = useSelectStyles();

  return (
    <div className="explore__options-box">
      <Text style={{ "textAlign": "center", "fontWeight": "bold", "paddingRight": "10px" }} variant="large">Closest</Text>
      <FormControl>
        <Select
          native
          value={props.value}
          onChange={(event) => { props.changeConditional(event.target.value) }}
          classes={{
            root: selectClasses.root
          }}>
          {props.choices.map((choice, index) => (<option key={index} value={choice}>{choice.replace("_", " ")}</option>))}
        </Select>
      </FormControl>
      <Text style={{ "textAlign": "center", "fontWeight": "bold", "paddingLeft": "10px"}} variant="large">Artworks:</Text>

    </div>
  );
}