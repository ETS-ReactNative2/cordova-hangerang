import React, { Component } from 'react';
import firebase, {base} from './firebase.js';
import NativeSelect from '@material-ui/core/NativeSelect';

class GroupSelect extends Component {
  constructor(props){
    super(props)
    this.state = {
      group: '',
      owned: [],
    }
  }

  handleSelect = event => {
     this.setState({ [event.target.name]: event.target.value });
     this.props.onChange(event.target.value);
  };

  componentDidMount(){
    if(this.props.uid){
      const usersRef = firebase.database().ref('members');
      usersRef.orderByChild("uid").equalTo(this.props.uid).once('value', (snapshot) => {
        if (snapshot.exists()) {
          var key = Object.keys(snapshot.val())[0];
          base.listenTo(`/members/${key}`, {
            context: this,
            then(member){
              if(member.owned){
                Object.entries(member.owned).map((item) => {
                  const groupsRef = firebase.database().ref(`/groups/${item[1].id}`);
                  groupsRef.once('value',
                    (snapshot) => {
                      if (snapshot.exists()) {
                        let index = this.state.owned.findIndex(el => el.key === item[1].id);
                        if(index === -1){
                          this.setState({ owned: [...this.state.owned, {key: item[1].id, value: snapshot.val()} ] });
                        }
                      }
                    });
                    return console.log("item");
                });
              }
            }
          });
        }
      });
    }
  }

  render(){
    let Groups = this.state.owned.map((c,i) => {
      let key = c['key'];
      let group = c['value'];
      return (
          <option value={key} key={'group'+key}>{group.name}</option>
      )
    });

    return(
      <NativeSelect
        value={this.state.group}
        onChange={this.handleSelect}
        name="group"
        inputProps={{
          name: 'group',
          id: 'grp-multi',
        }}
      >
        <option value=''>Who's Invited?</option>
        {Groups}
      </NativeSelect>
    )
  }
}

export default GroupSelect;
