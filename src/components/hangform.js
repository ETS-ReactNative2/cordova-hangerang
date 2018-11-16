import React from "react";
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import DateTimePicker from 'material-ui-datetimepicker';
import DatePickerDialog from 'material-ui/DatePicker/DatePickerDialog'
import TimePickerDialog from 'material-ui/TimePicker/TimePickerDialog';
import MultiToggle from 'react-multi-toggle';
import GoogleSuggest from './places.js';

class HangForm extends React.Component {
  static propTypes = {
    addSteps: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.addSteps([
      {
        //title: 'Create A Hang',
        text: "<b>Welcome!</b> Let's begin by making a Hang!",
        selector: '.add-hang-title',
        position: 'top',
        style: {
          mainColor: '#34b6ee',
          beacon: {
            inner: '#34b6ee',
            outer: '#34b6ee',
          },
        },
      },
      {
        title: 'Step 1',
        text: "Let's choose who should be able to see and join your <strong>Hang</strong>",
        selector: '.toggle-wrapper',
        position: 'top',
        style: {
          mainColor: '#34b6ee',
          beacon: {
            inner: '#34b6ee',
            outer: '#34b6ee',
          },
        },
      },
      {
        title: 'Step 2',
        text: "Enter a Title or Activity for your Hang",
        selector: '.input-title',
        position: 'top',
        style: {
          mainColor: '#34b6ee',
          beacon: {
            inner: '#34b6ee',
            outer: '#34b6ee',
          },
        },
      },
      {
        title: 'Step 3',
        text: "Enter a Date and Time for your Hang",
        selector: '.input-datetime',
        position: 'top',
        style: {
          mainColor: '#34b6ee',
          beacon: {
            inner: '#34b6ee',
            outer: '#34b6ee',
          },
        },
      },
      {
        title: 'Step 4',
        text: "Search for and select a Location for your Hang",
        selector: '.input-location',
        position: 'top',
        style: {
          mainColor: '#34b6ee',
          beacon: {
            inner: '#34b6ee',
            outer: '#34b6ee',
          }
        },
      },
      {
        title: 'Step 5',
        text: "Save your Hang",
        selector: '.add-hang-footer',
        position: 'bottom',
        style: {
          mainColor: '#34b6ee',
          beacon: {
            inner: '#34b6ee',
            outer: '#34b6ee',
          },
        },
      },
    ]);
  }

  render(){

      const switchOptions = [
        {
          displayName: 'Invite Only',
          value: 'invite'
        },
        // {
        //   displayName: 'Friends+',
        //   value: 'friends'
        // },
        {
          displayName: 'Public',
          value: 'public'
        },
      ];

      return (
        <MuiThemeProvider>
        { this.props.submit ?
          <section className='add-hang-fixed'>
          <i className={'fa fa-times clear-submit'} onClick={this.props.clearSubmit}></i>
          <h3>{"You Made A Hang! How Fantastic!"}</h3>
          <button className="center" onClick={this.props.toggleSubmit()}>{"Make Another?"}</button>
          </section>
        : <section className={this.props.makeHang ? 'add-hang add-hang-tall' : 'add-hang'}>
              <h3 className={'add-hang-title'}>{this.props.makeHang ? "Let's Make A Hang!" : "Wanna Make A Hang?"}</h3>
              <div className={'add-hang-form'}>
              { this.props.makeHang ?
              <div>
              <MultiToggle options={switchOptions} selectedOption={this.props.visibility} onSelectOption={this.props.setHangVisibility} label="Who Is Invited?" />
              <form onSubmit={this.props.handleSubmit}>
                <input type="hidden" name="username" onChange={this.props.handleChange} value={this.props.username} />
                <div className="add-hang-wrapper">
                  <TextField className={"input-title"} type="text" name="title" placeholder="What to do?" onChange={this.props.handleChange} value={this.props.title} />
                  <DateTimePicker format='MMM DD, YYYY hh:mm A' className={"input-datetime"} name="datetime" placeholder="When?" onChange={this.props.setDate} DatePicker={DatePickerDialog} TimePicker={TimePickerDialog} timePickerDialogStyle={{height:'1vh'}} minutesStep={15} />
                  <GoogleSuggest name="location" onLocChange={this.props.setLocation} onNameChange={this.props.setName} getLocation={this.props.location.formatted_address} onSubmit={this.props.submit} />
                </div>
                { this.props.user && this.props.title && this.props.datetime && this.props.location ?
                <div className="add-hang-footer">
                  <button className="btn">{"Let's Do This!"}</button>
                </div> : ''
                }
              </form>
              <i className={'fa fa-chevron-up'} onClick={this.props.toggleForm}></i></div>
              : '' }
              </div>
              { !this.props.makeHang ?
                <i className={'fa fa-chevron-down'} onClick={this.props.toggleForm}></i>
              : '' }
        </section> }
        </MuiThemeProvider>
      );
    }

}

export default HangForm;
