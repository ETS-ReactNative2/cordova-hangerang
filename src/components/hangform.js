import React from "react";
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import DateTimePicker from 'material-ui-datetimepicker';
import DatePickerDialog from 'material-ui/DatePicker/DatePickerDialog'
import TimePickerDialog from 'material-ui/TimePicker/TimePickerDialog';
import ContentClear from 'material-ui/svg-icons/content/clear';
import MultiToggle from 'react-multi-toggle';
import GoogleSuggest from './places.js';
import GroupSelect from './groupselect.js';
import Select from 'react-select';
import slugify from 'slugify';

// const colors = [
//   '#f41c21',
//   '#fc5121',
//   '#fbaf17',
//   '#00bb77',
//   '#11c8cd',
//   '#34b6ee',
//   '#652c90',
//   '#c724eb',
//   '#ec008c',
// ];
//
const customStyles = {
  menuList: (provided, state) => ({
    ...provided,
    background: 'white',
    position: 'absolute',
    bottom: '3rem',
    minWidth: '300px',
  }),
  // multiValue: (styles) => {
  //   return {
  //     ...styles,
  //     backgroundColor: colors[Math.floor(Math.random() * colors.length)],
  //   };
  // },
  // multiValueLabel: (styles) => {
  //   return {
  //   ...styles,
  //   color: 'white',
  //   fontSize: '0.9rem',
  //   };
  // },
};

class HangForm extends React.Component {
  constructor() {
    super();
    this.state = {
      options: [],
      selectedOption: null,
    }
  }

  // static propTypes = {
  //   addSteps: PropTypes.func.isRequired,
  // };

  componentDidMount() {
    // this.props.addSteps([
    //   {
    //     //title: 'Create A Hang',
    //     text: "<b>Welcome!</b> Let's begin by making a Hang!",
    //     selector: '.add-hang-title',
    //     position: 'top',
    //     style: {
    //       mainColor: '#34b6ee',
    //       beacon: {
    //         inner: '#34b6ee',
    //         outer: '#34b6ee',
    //       },
    //     },
    //   },
    //   {
    //     title: 'Step 1',
    //     text: "Let's choose who should be able to see and join your <strong>Hang</strong>",
    //     selector: '.toggle-wrapper',
    //     position: 'top',
    //     style: {
    //       mainColor: '#34b6ee',
    //       beacon: {
    //         inner: '#34b6ee',
    //         outer: '#34b6ee',
    //       },
    //     },
    //   },
    //   {
    //     title: 'Step 2',
    //     text: "Enter a Title or Activity for your Hang",
    //     selector: '.input-title',
    //     position: 'top',
    //     style: {
    //       mainColor: '#34b6ee',
    //       beacon: {
    //         inner: '#34b6ee',
    //         outer: '#34b6ee',
    //       },
    //     },
    //   },
    //   {
    //     title: 'Step 3',
    //     text: "Enter a Date and Time for your Hang",
    //     selector: '.input-datetime',
    //     position: 'top',
    //     style: {
    //       mainColor: '#34b6ee',
    //       beacon: {
    //         inner: '#34b6ee',
    //         outer: '#34b6ee',
    //       },
    //     },
    //   },
    //   {
    //     title: 'Step 4',
    //     text: "Search for and select a Location for your Hang",
    //     selector: '.input-location',
    //     position: 'top',
    //     style: {
    //       mainColor: '#34b6ee',
    //       beacon: {
    //         inner: '#34b6ee',
    //         outer: '#34b6ee',
    //       }
    //     },
    //   },
    //   {
    //     title: 'Step 5',
    //     text: "Save your Hang",
    //     selector: '.add-hang-footer',
    //     position: 'bottom',
    //     style: {
    //       mainColor: '#34b6ee',
    //       beacon: {
    //         inner: '#34b6ee',
    //         outer: '#34b6ee',
    //       },
    //     },
    //   },
    // ]);
    if(this.props.crew){
      Object.entries(this.props.crew).map((c,i) => {
        let member = c[1];
        if(member.user){
          this.setState(prevState => ({
            options: [...prevState.options,
              {
                label: member.user,
                status: 'invited',
                user: member.user,
                uid: member.uid,
                userphoto: member.userphoto,
                value: slugify(member.user),
              }
            ]
          }));
          return console.log("c");
        }
      });
    }
  }

  handleOptionChange = (selectedOption) => {
    this.setState({ selectedOption });
    this.props.setInvitedCrew( selectedOption );
  }

  render(){

      const {
        options,
        selectedOption,
      } = this.state;

      const switchOptions = [
        {
          displayName: 'Groups',
          value: 'groups'
        },
        {
          displayName: 'Invitation',
          value: 'invite'
        },
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
              <h3 className={'add-hang-title'}>{this.props.makeHang ? "Let's Make A Hang!" : ""}</h3>
              <div className={'add-hang-form'}>
              { this.props.makeHang ?
              <div>
              <MultiToggle options={switchOptions} selectedOption={this.props.visibility} onSelectOption={this.props.setHangVisibility} label="Invite Mode" />
              <form onSubmit={this.props.handleSubmit}>
                <input type="hidden" name="username" onChange={this.props.handleChange} value={this.props.username} />
                <div className="add-hang-wrapper">
                  { this.props.visibility === 'groups' &&
                  <GroupSelect uid={this.props.user.uid} onChange={this.props.setInvitedGroup} />
                  }
                  { this.props.visibility === 'invite' && this.state.options.length > 0 &&
                     <Select
                       className={'group-select'}
                       value={selectedOption}
                       placeholder={'Invite People from Crew'}
                       onChange={this.handleOptionChange}
                       options={options}
                       isMulti={true}
                       styles={customStyles}
                     />
                   }
                  <TextField className={"input-title"} type="text" name="title" placeholder="What to do?" onChange={this.props.handleChange} value={this.props.title} />
                  <DateTimePicker format='MMM DD, YYYY hh:mm A' className={"input-datetime"} name="datetime" placeholder="When?" onChange={this.props.setDate} DatePicker={DatePickerDialog} TimePicker={TimePickerDialog} timePickerDialogStyle={{height:'1vh'}} minutesStep={15} />
                  {this.props.location.formatted_address && this.props.location.place_id && this.props.location.geometry ?
                  <div className={"input-where-filled"}><TextField className={"input-title"} value={this.props.name} /><ContentClear onClick={() => {this.props.setLocation('')}} /></div> :
                  <GoogleSuggest name="location" placeholder="Where?" onLocChange={this.props.setLocation} onNameChange={this.props.setName} getLocation={this.props.location.formatted_address} onSubmit={this.props.submit} />
                  }
                </div>
                { this.props.user && this.props.title && this.props.datetime && this.props.location ?
                <div className="add-hang-footer">
                  <button className="btn">{"Let's Do This!"}</button>
                </div> : ''
                }
              </form>
              <i className={'fa fa-chevron-down'} onClick={this.props.toggleForm}></i></div>
              : '' }
              </div>
              { !this.props.makeHang ?
                <i className={'fa fa-plus'} onClick={this.props.toggleForm}></i>
              : '' }
        </section> }
        </MuiThemeProvider>
      );
    }

}

export default HangForm;
