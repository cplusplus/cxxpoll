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
import ReactFireMixin from 'reactfire';
import { Dialog, TextField, RaisedButton, FloatingActionButton, List, ListItem } from 'material-ui';

import PollAppBar from './appbar';
import { firebaseRoot } from './config';
import { AuthStateMixin, FirebaseValue } from './firebaseutil';
import { CreatePoll } from './poll';
import { nameToUrl } from './util';

export function userOrgMembership(uid, orgId) {
  return firebaseRoot.child(`users/${uid}/organizations/${orgId}`);
}

export let OrganizationPage = React.createClass({
  mixins: [ReactFireMixin, React.addons.LinkedStateMixin, AuthStateMixin],

  componentWillMount() {
    this.componentWillReceiveProps(this.props);
  },

  componentWillReceiveProps(nextProps) {
    if (this.firebaseRefs.org !== undefined) this.unbind('org');
    this.bindAsObject(firebaseRoot.child(`organizations/${nextProps.params.orgId}`), 'org');
    if (this.firebaseRefs.orgPolls !== undefined) this.unbind('orgPolls');
    this.bindAsArray(firebaseRoot.child(`organizationPolls/${nextProps.params.orgId}`), 'orgPolls');
  },

  _orgName() {
    if (this.state.org) {
      return this.state.org.name || '';
    }
    return '';
  },

  render() {
    let orgId = this.props.params.orgId;
    return (
      <div>
        <PollAppBar title={this._orgName()} auth={this.state.auth}/>

        <h1>Polls</h1>
        {
          this.state.auth && this.state.org ?
          <CreatePoll auth={this.state.auth} org={this.state.org} />
          : ""
        }
        <List>
          {
            this.state.orgPolls.map(({'.value': pollId}) => {
              return (
                <ListItem
                  key={pollId}
                  primaryText={
                    <FirebaseValue
                      fbRef={firebaseRoot.child(`polls/${pollId}/name`)}/>
                  }
                  onTouchTap={()=>this.props.history.pushState(null, `/o/${orgId}/${pollId}`)}
                  />
              );
            })
          }
        </List>
      </div>
    );
  },
});

export let CreateOrganization = React.createClass({
  render() {
    return (
      <div>
        <Dialog ref="dialog"
          title="Create Organization"
          actions={[
            { text: 'Cancel' },
            { text: 'Submit', onTouchTap: () => this._doCreate(), ref: 'submit' }
          ]}
          actionFocus="submit"
          >
          <TextField ref="name" floatingLabelText="Name"/>
        </Dialog>
        <RaisedButton
          label="Create Organization"
          onTouchTap={()=>this.refs.dialog.show()}
          />
      </div>
    );
  },

  _doCreate() {
    let name = this.refs.name.getValue();
    let orgId = nameToUrl(name);
    let orgPath = `organizations/${orgId}`;
    firebaseRoot.child(orgPath).transaction(oldOrg => {
      if (oldOrg) {
        // Abort.
        return undefined;
      }
      return {
        owner: this.props.auth.uid,
        name: name,
      };
    }, (error, committed, snapshot) => {
      if (!committed) {
        if (error) {
          console.error(`While writing ${orgPath}`, error);
        }
        this.refs.name.setErrorText("Similar organization name already used.");
        return;
      }
      userOrgMembership(this.props.auth.uid, orgId).set(true, error => {
        this.refs.dialog.dismiss();
        if (error) {
          console.error(`While joining user ${this.props.auth.uid} to org ${orgId}:`, error);
        }
      });
    }, /*showIntermediateEvents=*/false);
  },
});

export let OrgJoinLeaveButton = React.createClass({
  mixins: [ReactFireMixin],

  _orgMembershipRef(props) {
    if (props.auth) {
      return userOrgMembership(props.auth.uid, props.orgId);
    } else {
      return null;
    }
  },

  getInitialState: function() {
    return {
      isMember: null,
    };
  },

  componentWillMount() {
    this.componentWillReceiveProps(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.firebaseRefs.isMember !== undefined) {
      this.unbind('isMember');
    }
    let orgMembershipRef = this._orgMembershipRef(nextProps);
    if (orgMembershipRef) {
      this.bindAsObject(this._orgMembershipRef(nextProps), 'isMember');
    }
  },

  render() {
    if (this.props.auth) {
      return (
        <RaisedButton
          label={this.isMember() ? "Leave" : "Join"}
          onTouchTap={(e) => this._onTouchTap(e)}
          style={this.props.style}
          />
      );
    } else {
      return <span/>
    }
  },

  isMember() {
    return this.state.isMember && this.state.isMember['.value'];
  },

  _onTouchTap(e) {
    if (this.isMember()) {
      this._orgMembershipRef(this.props).remove();
    } else {
      this._orgMembershipRef(this.props).set(true);
    }
    // Prevent the containing element from seeing the click.
    e.stopPropagation();
  }
});
