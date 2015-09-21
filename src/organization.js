'use strict';

import React from 'react';
import ReactFireMixin from 'reactfire';
import { Dialog, TextField, RaisedButton } from 'material-ui';

import { firebaseRoot } from './config';

function nameToUrl(name) {
  return name.replace(/[^a-zA-Z0-9+]+/g, '-').toLowerCase();
};

export function userOrgMembership(uid, orgId) {
  return firebaseRoot.child(`users/${uid}/organizations/${orgId}`);
}

export let OrganizationPage = React.createClass({
  render() {
    return (
      <div>Organization Page!</div>
    );
  }
});

export let CreateOrganization = React.createClass({
  render() {
    return (
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
      if (committed) {
        userOrgMembership(this.props.auth.uid, orgId).set(true, error => {
          this.refs.dialog.dismiss();
          if (error) {
            console.error(`While joining user ${this.props.auth.uid} to org ${orgId}:`, error);
          }
        })
      } else {
        if (error) {
          console.error(`While writing ${orgPath}`, error);
        }
        this.refs.name.setErrorText("Similar organization name already used.");
      }
    }, /*showIntermediateEvents=*/false);
  },

  show() {
    this.refs.dialog.show();
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
