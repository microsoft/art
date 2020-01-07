import React from 'react';
import {Text, FontIcon, mergeStyles} from 'office-ui-fabric-react';
import {CommandBar, ICommandBarItemProps} from 'office-ui-fabric-react/lib/CommandBar';
import {initializeIcons} from 'office-ui-fabric-react/lib/Icons';

// initialize icons
initializeIcons();

const iconClass = mergeStyles({
  paddingTop: 10,
  paddingRight: 10,
  color: "#005a9e"
});

export const Header : React.FunctionComponent = () => {
  
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
      commandBarButtonAs: title
    }
  ];

  const _farItems: ICommandBarItemProps[] = [
    {
      key: 'cart',
      text: 'Cart',
      ariaLabel: 'Cart',
      iconOnly: true,
      iconProps: { iconName: 'ShoppingCart' }
    }
  ];

  return (
    <CommandBar
      items={_items}
      farItems={_farItems}
    />
  );
};