'use strict';

import Firebase from 'firebase';
import React from 'react';
import ReactFireMixin from 'reactfire';
import mui from 'material-ui';
import { Router, Route } from 'react-router';
import { FrontPage } from './frontpage';
import { Organization } from './organization';
import { Poll } from './poll';

// Needed for material-ui. Can go away when react 1.0 releases.
require('react-tap-event-plugin')();

let ThemeManager = new mui.Styles.ThemeManager();

var PollRoutes = React.createClass({
  render() {
    return (
      <Router>
        <Route path="/" component={FrontPage}/>
        <Route path="/org/:orgId" component={Organization}/>
        <Route path="/poll/:pollId" component={Poll}/>
      </Router>
    );
  },
  getChildContext() {
    return {
      firebaseRoot: new Firebase('https://cxxpoll.firebaseio.com/'),
      muiTheme: ThemeManager.getCurrentTheme(),
    };
  },
});

PollRoutes.childContextTypes = {
  firebaseRoot: React.PropTypes.object,
  muiTheme: React.PropTypes.object,
};

React.render(<PollRoutes />, document.body);
