'use strict';

import React from 'react';
import { AppBar, FlatButton} from 'material-ui';

import { firebaseRoot } from './config';

let PollAppBar = React.createClass({
  render() {
    let auth = this.props.auth;
    let rightButton;
    if (auth) {
      rightButton = <FlatButton label="Logout" onTouchTap={this.onLogout}/>
    } else {
      rightButton = <FlatButton label="Login" onTouchTap={this.onLogin}/>
    }
    return (
      <AppBar
      title={this.props.title}
      iconElementRight={rightButton}
      />
    );
  },

  onLogin() {
    firebaseRoot.authWithOAuthPopup("github", function(error, authData) {
      if (error) {
        console.log("Authentication Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        firebaseRoot.child(`users/${authData.uid}/name`).transaction(oldValue => {
          if (oldValue) {
            // No need to change it.
            return undefined;
          }
          return authData.github.displayName;
        })
      }
    });
  },

  onLogout() {
    firebaseRoot.unauth();
  },
});

export default PollAppBar;
