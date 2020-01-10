import React from 'react';
import {Text, FontIcon, mergeStyles} from 'office-ui-fabric-react';
import { Depths } from '@uifabric/fluent-theme/lib/fluent/FluentDepths';
import {CommandBar, ICommandBarItemProps} from 'office-ui-fabric-react/lib/CommandBar';
import {initializeIcons} from 'office-ui-fabric-react/lib/Icons';

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
  boxShadow: Depths.depth8
});

export const NavBar : React.FunctionComponent = () => {
  
  const title = () => {
    return (
      <Text variant="xxLarge">
        <FontIcon iconName="BranchSearch" className={iconClass} />
        Deep Culture Explorer
      </Text>
    )
  };
  const _items: ICommandBarItemProps[] = [
    {
      key: 'title',
      text: 'Deep Culture Explorer',
      iconProps: { iconName: 'BranchSearch' },
      commandBarButtonAs: title,
    }
  ];

  return (
    <CommandBar
      items={_items}
      className={headerClass}
      style={{ color: 'purple' }}
    />
  );
};