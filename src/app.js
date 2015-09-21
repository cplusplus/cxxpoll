'use strict';

import createBrowserHistory from 'history/lib/createBrowserHistory';
import mui from 'material-ui';
import Firebase from 'firebase';
import React from 'react';
import ReactFireMixin from 'reactfire';
import { Router, Route } from 'react-router';

import FrontPage from './frontpage';
import User from './user';
import { OrganizationPage } from './organization';
import { PollPage } from './poll';

// Needed for material-ui. Can go away when react 1.0 releases.
require('react-tap-event-plugin')();

let ThemeManager = new mui.Styles.ThemeManager();

var PollRoutes = React.createClass({
  render() {
    return (
      <Router history={createBrowserHistory()}>
        <Route path="/" component={FrontPage}/>
        <Route path="/o/:orgId" component={OrganizationPage}/>
        <Route path="/o/:orgId/:pollId" component={PollPage}/>
        <Route path="/u/:userId" component={User}/>
      </Router>
    );
  },
  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme(),
    };
  },
});

PollRoutes.childContextTypes = {
  muiTheme: React.PropTypes.object,
};

React.render(<PollRoutes />, document.body);
