import React from 'react';

import {Image, Text, Stack, ImageFit, mergeStyles} from 'office-ui-fabric-react';
import GalleryItem from './GalleryItem';

const spacerB = mergeStyles({
    padding: 10,
  });

interface IState {}

type ArtworkProps = {
    item: GalleryItem
}

class ResultArtwork extends React.Component < ArtworkProps, IState > {


    render() {
      return (
          <Stack horizontalAlign="start" verticalAlign="center" horizontal className={spacerB}>
              <Image src={this.props.item.url} height={200} className={spacerB}/>
              <Stack>
                <Text variant="large">{this.props.item.title}</Text>
                <Text variant="small">{this.props.item.principal}</Text>
              </Stack>
          </Stack>
      )


    }
};

export default ResultArtwork;