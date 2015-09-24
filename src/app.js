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
