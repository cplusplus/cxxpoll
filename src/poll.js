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
import { nameToUrl } from './util';

export let PollPage = React.createClass({
  mixins: [ReactFireMixin, React.addons.LinkedStateMixin, AuthStateMixin],

  rebindAs(type, ref, name) {
    let oldRef = this.firebaseRefs[name];
    if (oldRef === undefined || oldRef.toString() !== ref.ref().toString()) {
      if (oldRef !== undefined) this.unbind(name);
      if (type === Object) {
        this.bindAsObject(ref, name);
      } else if (type === Array){
        this.bindAsArray(ref, name);
      } else {
        console.error("rebindAs type must be Object or Array; was:", type);
      }
    }
  },

  componentWillMount() {
    this.componentWillReceiveProps(this.props);
  },

  componentWillReceiveProps(nextProps) {
    this.rebindAs(Object, firebaseRoot.child(`organizations/${nextProps.params.orgId}/name`), 'orgName');
    this.rebindAs(Object, firebaseRoot.child(`polls/${nextProps.params.pollId}`), 'poll');
    this.rebindAs(Array, firebaseRoot.child(`pollOptions/${nextProps.params.pollId}`), 'pollOptions');
    this.rebindAs(Object, firebaseRoot.child(`pollVotes/${nextProps.params.pollId}`), 'pollVotes');
  },

  render() {
    return (
      <div>
        <PollAppBar title={this.state.orgName} auth={this.state.auth}/>
        <h1>{this.state.poll ? this.state.poll.name : ""}</h1>

      </div>
    );
  },
});

export let CreatePoll = React.createClass({
  render() {
    return (
      <div>
        <Dialog ref="dialog"
          title="Create Poll"
          actions={[
            { text: 'Cancel' },
            { text: 'Submit', onTouchTap: () => this._doCreate(), ref: 'submit' }
          ]}
          actionFocus="submit"
          >
          <p><strong>Organization</strong>: {this.props.org.name}</p>
          <TextField ref="name" floatingLabelText="Title"/>
        </Dialog>
        <RaisedButton
          label="Create Poll"
          onTouchTap={()=>this.refs.dialog.show()}
          />
      </div>
    );
  },

  _doCreate() {
    let name = this.refs.name.getValue();
    let pollId = nameToUrl(name);
    let pollPath = `polls/${pollId}`;
    firebaseRoot.child(pollPath).transaction(oldPoll => {
      if (oldPoll) {
        // Abort.
        return undefined;
      }
      return {
        owner: this.props.auth.uid,
        name: name,
        organization: this.props.org['.key'],
        state: 'creating',
      };
    }, (error, committed, snapshot) => {
      if (!committed) {
        if (error) {
          console.error(`While writing ${pollPath}`, error);
        }
        this.refs.name.setErrorText("Similar poll title already used.");
        return;
      }
      firebaseRoot.child(`organizationPolls/${this.props.org['.key']}`).push(pollId, error => {
        this.refs.dialog.dismiss();
        if (error) {
          console.error(`While joining user ${this.props.auth.uid} to org ${orgId}:`, error);
        }
      });
    }, /*showIntermediateEvents=*/false);
  },
});
