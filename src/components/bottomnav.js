import React, {Component} from 'react';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';

//const recentsIcon = <i className="fa fa-clock-o"></i>;
const hangsIcon = <i className="fa fa-bolt"></i>;
const nearbyIcon = <i className="fa fa-map-marker"></i>;
let addIcon = <i className="fa fa-plus"></i>;

/**
 * A simple example of `BottomNavigation`, with three labels and icons
 * provided. The selected `BottomNavigationItem` is determined by application
 * state (for instance, by the URL).
 */
class BottomNav extends Component {
  select(e) {
    var mode = {
      0: "nearby",
      1: "add",
      2: "hangs",
    };
    if( mode[e] === "add" ){
      this.props.toggleForm();
      this.props.setSelectedIndex( e );
    }else{
      this.props.hideForm();
      this.props.setSelectedIndex( e );
      this.props.setMode( mode[e] );
    }
  }

  render() {
    return (
      <Paper zDepth={1} className="footer-nav">
        <BottomNavigation selectedIndex={this.props.selectedIndex}>
          <BottomNavigationItem
            label="Nearby"
            icon={nearbyIcon}
            onClick={() => this.select(0) }
          />
          <BottomNavigationItem
            label="Create"
            icon={addIcon}
            onClick={() => this.select(1) }
          />
          <BottomNavigationItem
            label="Hangs"
            icon={hangsIcon}
            onClick={() => this.select(2) }
          />
          {/*<BottomNavigationItem
            label="Today"
            icon={recentsIcon}
            onClick={() => this.select(2) }
          />*/}
        </BottomNavigation>
      </Paper>
    );
  }
}

export default BottomNav;
