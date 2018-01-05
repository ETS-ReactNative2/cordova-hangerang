import React from "react";
import ReactGoogleMapLoader from "react-google-maps-loader";
import ReactGooglePlacesSuggest from "react-google-places-suggest";
import TextField from 'material-ui/TextField';

const MY_API_KEY = "AIzaSyBto4MuLZrVQi0T5MdMVR3lC-dHYz9f3Yc"

class GoogleSuggest extends React.Component {
  state = {
    search: "",
    value: "",
  }

  handleInputChange(e) {
    this.setState({search: e.target.value, value: e.target.value})
  }

  handleSelectSuggest(suggest) {
    //console.log(suggest) // eslint-disable-line
    this.setState({
      search: "",
      value: suggest.formatted_address,
    })
    this.props.getSuggest(suggest);
  }

  render() {
    const {search, value} = this.state
    return (
      <ReactGoogleMapLoader
        params={{
          key: MY_API_KEY,
          libraries: "places,geocode",
        }}
        render={googleMaps =>
          googleMaps && (
            <ReactGooglePlacesSuggest
              googleMaps={googleMaps}
              autocompletionRequest={{
                input: search,
                // Optional options
                // https://developers.google.com/maps/documentation/javascript/reference?hl=fr#AutocompletionRequest
              }}
              // Optional props
              onSelectSuggest={this.handleSelectSuggest.bind(this)}
              textNoResults="My custom no results text" // null or "" if you want to disable the no results item
              customRender={prediction => (
                <div className="customWrapper">
                  {prediction
                    ? prediction.description
                    : "My custom no results text"}
                </div>
              )}
            >
              <TextField
                type="text"
                value={value||this.props.setValue}
                placeholder="Where?"
                onChange={this.handleInputChange.bind(this)}
              />
            </ReactGooglePlacesSuggest>
          )
        }
      />
    )
  }
}

export default GoogleSuggest;
