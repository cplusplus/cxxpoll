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

import _ from 'lodash';
import React from 'react';
import ReactFireMixin from 'reactfire';
import { List, ListItem, TextField, RaisedButton } from 'material-ui';
import { Link } from 'react-router';

import PollAppBar from './appbar';
import { firebaseRoot } from './config';
import { AuthStateMixin, FirebaseValue } from './firebaseutil';
import { CreateOrganization, OrgJoinLeaveButton } from './organization';

let FrontPage = React.createClass({
  mixins: [ReactFireMixin, React.addons.LinkedStateMixin, AuthStateMixin],

  componentWillMount() {
    this.bindAsArray(firebaseRoot.child('organizations'), 'organizations');
  },

  getInitialState: function() {
    return {
      auth: null,
      orgFilter: ''
    };
  },

  onAuth(auth) {
    if (this.firebaseRefs.userData !== undefined) {
      this.unbind('userData');
    }
    if (auth) {
      this.bindAsObject(firebaseRoot.child(`users/${auth.uid}`), 'userData');
    }
  },

  render() {
    return (
      <div>
        <PollAppBar title="C++ Polls" auth={this.state.auth}/>

        {
          this.state.auth ?
          <CreateOrganization auth={this.state.auth} />
          : ""
        }
        {
          this.state.userData ?
          <List subheader="Your Organizations">
            {
              _.keys(this.state.userData.organizations).map(orgId => {
                return (
                  <ListItem
                    key={orgId}
                    primaryText={
                      <FirebaseValue
                        fbRef={firebaseRoot.child(`organizations/${orgId}/name`)}/>
                    }
                    rightIconButton={<OrgJoinLeaveButton auth={this.state.auth} orgId={orgId} />}
                    onTouchTap={()=>this.props.history.pushState(null, `/o/${orgId}`)}
                    />
                );
              })
            }
          </List>
          : ""
        }
        <List subheader="All Organizations">
          <ListItem primaryText={
              <TextField
                floatingLabelText="Filter by"
                valueLink={this.linkState('orgFilter')}
                />
            }/>
          {
            this.state.organizations.filter(org => {
              return _.includes(org.name, this.state.orgFilter);
            }).map(org => {
              return (
                <ListItem
                  key={org['.key']}
                  primaryText={org.name}
                  rightIconButton={<OrgJoinLeaveButton auth={this.state.auth} orgId={org['.key']} />}
                  onTouchTap={()=>this.props.history.pushState(null, `/o/${org['.key']}`)}
                  />
              );
            })
          }
        </List>
      </div>
    );
  },
});

export default FrontPage;
