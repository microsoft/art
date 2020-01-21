import React from 'react';
import {Text, FontIcon, mergeStyles} from 'office-ui-fabric-react';
import { Depths } from '@uifabric/fluent-theme/lib/fluent/FluentDepths';
import {CommandBar, ICommandBarItemProps} from 'office-ui-fabric-react/lib/CommandBar';
import {initializeIcons} from 'office-ui-fabric-react/lib/Icons';
import mosaicLogo from './mosaicLogo.png';

// initialize icons
initializeIcons();

const iconClass = mergeStyles({
  // paddingTop: 10,
  paddingRight: 10,
  color: "#005a9e"
});

const headerClass = mergeStyles({
  paddingBottom: 10,
  paddingTop: 10,
  boxShadow: Depths.depth8,
});

const headerTitle = mergeStyles({
  color: "black",
  textDecoration: "none",
  userSelect: "none",
  outline: "none"
})

const learning = mergeStyles({
  color: "black",
  textDecoration: "none",
  userSelect: "none",
  outline: "none",
  paddingTop: "8px"
})

const logoStyle = mergeStyles({
  height: "100%"
})

export const NavBar : React.FunctionComponent = () => {
  
  const title = () => {
    return (
      <a className={headerTitle} href="/">
        <Text variant="xxLarge">
          <img className={logoStyle} src={mosaicLogo}/>
        </Text>
      </a>
    )
  };

  const learnMore = () => {
    return (
      <a className={learning} href="/about">
        <Text variant="xxLarge">
          Learn More
        </Text>
      </a>
    )
  };

  const _items: ICommandBarItemProps[] = [
    {
      key: 'title',
      text: 'mosaic',
      commandBarButtonAs: title,
    }
  ];

  const _faritems: ICommandBarItemProps[] = [
    {
      key: 'learnMore',
      text: 'learnMore',
      commandBarButtonAs: learnMore,
    }
  ]

  return (
    <CommandBar
      items={_items}
      farItems={_faritems}
      className={headerClass}
      style={{ color: 'purple' }}
    />
  );
};