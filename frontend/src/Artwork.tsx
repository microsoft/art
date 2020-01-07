import React from 'react';

import {Image, Text, Stack, ImageFit, mergeStyles} from 'office-ui-fabric-react';
import GalleryItem from './GalleryItem';

const spacerB = mergeStyles({
    paddingBottom: 10,
  });

type ArtworkProps = {
    item: GalleryItem
}
class Artwork extends React.Component < ArtworkProps > {
    render() {
        return (
            <Stack horizontalAlign="center" verticalAlign="start" className={spacerB}>
                <Image src={this.props.item.url} imageFit={ImageFit.centerContain} width={400} height={200} className={spacerB}/>
                <Stack>
                  <Text variant="large">{this.props.item.title}</Text>
                  <Text variant="small">{this.props.item.principal}</Text>
                </Stack>
            </Stack>
        )
    }
};

export default Artwork;