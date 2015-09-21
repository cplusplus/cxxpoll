'use strict';

import _ from 'lodash';
import React from 'react';
import ReactFireMixin from 'reactfire';
import { List, ListItem, TextField, RaisedButton } from 'material-ui';
import { Link } from 'react-router';

import PollAppBar from './appbar';
import { firebaseRoot } from './config';
import { FirebaseValue } from './firebaseutil';
import { CreateOrganization, OrgJoinLeaveButton } from './organization';

let FrontPage = React.createClass({
  mixins: [ReactFireMixin, React.addons.LinkedStateMixin],

  componentWillMount() {
    this.bindAsArray(firebaseRoot.child('organizations'), 'organizations');
    firebaseRoot.onAuth(this.onAuth, this);
  },
  componentWillUnmount() {
    firebaseRoot.offAuth(this.onAuth, this);
  },

  getInitialState: function() {
    return {
      auth: null,
      orgFilter: ''
    };
  },

  onAuth(auth) {
    this.setState({auth: auth});
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
          (
            <div>
              <CreateOrganization
                ref="createOrganization"
                auth={this.state.auth}
                />
              <RaisedButton
                label="Create Organization"
                onTouchTap={()=>this.refs.createOrganization.show()}
                />
            </div>
          )
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
