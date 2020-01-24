import React from 'react';

interface IProps {
    math: any
};

interface IState {

};

class JuxPage extends React.Component<IProps, IState>{
    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
        let url = this.props.math.params.imgs;
        if (url) {
            let realurl = url.toString();
            realurl = decodeURIComponent(realurl);
        } else {
            console.log("URL IS MISSING DATA");
        }
    }
}

export default JuxPage