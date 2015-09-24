// Copyright 2015 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

import React from 'react';
import { AppBar, FlatButton} from 'material-ui';

import { firebaseRoot } from './config';

let PollAppBar = React.createClass({
  getTitle() {
    if (this.props.title === undefined) {
      return '';
    } else if (this.props.title.hasOwnProperty('.value')) {
      return this.props.title['.value'];
    } else {
      return this.props.title;
    }
  },

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
      title={this.getTitle()}
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
