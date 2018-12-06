import React from "react";
import PropTypes from "prop-types";
import {Route} from 'react-router-dom';

export default class ButtonLink extends React.Component {

    render() {
        return (
            <Route render={({history}) => (
                <button className={this.props.classy} onClick={() => {history.push(this.props.to) }}>
                    {this.props.text}
                </button>
            )}/>
        );
    }
}

ButtonLink.propTypes = {
    to: PropTypes.string.isRequired
};
