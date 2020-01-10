import React from'react';
import { mergeStyles } from 'office-ui-fabric-react'
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

// import './ContextualMenuExample.scss';

const spacerTR = mergeStyles({
    marginLeft: 'auto',
    marginRight: 'auto'
  });

type CollectionProps = {
    items: any,
    addtoCollection: any,
    addCollection: any
}

class CollectionAdder extends React.Component < CollectionProps > {
  public render(): JSX.Element {
    let menu = [{key: "NEWcollectionButton",
        text: "Add to new Collection",
        onClick: ()=>this.props.addCollection("Collection3")}] //creates a new collection- NEED TO ADD USER INPUT FOR NAME
    if (this.props.items.length !== 0){
        let keys = Object.keys(this.props.items)
        console.log(typeof(keys[0]))
        for (let i = 0; i<keys.length; i++){
            menu.push({key:keys[i],
            text:keys[i],
            onClick:()=> this.props.addtoCollection(keys[i])})
        }
    }
    return (
        <div className={spacerTR}>
            <DefaultButton
            text="Add to Collection"
            menuProps={{
                shouldFocusOnMount: true,
                items: menu
            }}/>
        </div>
        );
    }
}

export default CollectionAdder