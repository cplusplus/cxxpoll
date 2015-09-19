'use strict';

import React from 'react';
import ReactFireMixin from 'reactfire';
import { Link } from 'react-router';
import { AppBar, List } from 'material-ui';

export let FrontPage = React.createClass({
  mixins: [ReactFireMixin],

  render() {
    return (
        <div>
          <AppBar title="C++ Polls" />

          <List subheader="Your Organizations">
            
          </List>
        </div>
    );
  },
});
