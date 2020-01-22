import React from 'react';
import { Stack, Text, Separator, Pivot, PivotItem, IPivotStyles, PivotLinkFormat, PivotLinkSize } from 'office-ui-fabric-react';
import { Label } from 'office-ui-fabric-react/lib/Label';

interface IProps {
};

interface IState {
};

const pivotStyles: any = {
    link: [
      {
        color: 'black'
      }
    ],
    linkIsSelected: [
      {
        color: 'white',
        backgroundColor: 'black',
        fontWeight: 600,
        selectors: {
          ':before': {
            borderBottom: 'none'
          }
        }
      },
    ]
  };

export class AboutPage extends React.Component<IProps, IState> {


    render() {
        return (
            <Stack className="about__panel">
                <Pivot styles={pivotStyles} aria-label="" linkFormat={PivotLinkFormat.tabs} linkSize={PivotLinkSize.large}>
                    <PivotItem className="about__pivot" headerText="Instructions">
                        <Stack>
                            <Text style={{"textAlign":"left", "fontWeight":"bold"}} variant="xLarge">About Me</Text>
                            <Text variant="medium">
                            Born and raised in South Detroit, I consider myself a city boy. When I turned 18, I ran away from home and took a midnight train to anywhere it would take me.
                        When my train stopped, I headed into the first bar I could find. The room was fully enveloped in smoke and and smell of cheap perfume and wine, complete with a singer in the back.  
                            </Text>
                        </Stack>

                    </PivotItem>
                    <PivotItem className="about__pivot" headerText="Algorithm">
                        <Stack>
                            <Text style={{"textAlign":"left", "fontWeight":"bold"}} variant="xLarge">This Is About It</Text>
                            <Text variant="medium">
                                it makes things go fast

                            </Text>
                        </Stack>

                    </PivotItem>
                </Pivot>


            </Stack>
        )
      }

}

export default AboutPage