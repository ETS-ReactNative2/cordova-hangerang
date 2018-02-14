import React from "react";
import PropTypes from "prop-types";
import {Route} from 'react-router-dom';

export default class HangLink extends React.Component {

    render() {
        return (
            <Route render={({history}) => (
                <a onClick={() => {history.push(this.props.to) }}>
                    {this.props.text}
                </a>
            )}/>
        );
    }
}

HangLink.propTypes = {
    to: PropTypes.string.isRequired
};
