'use strict';

import React from 'react';
import ReactFireMixin from 'reactfire';
import { AppBar, List } from 'material-ui';
import { Link } from 'react-router';

let User = React.createClass({
  mixins: [ReactFireMixin],

  render() {
    return (
        <div>
          <PollAppBar title="Your Profile" />

        
        </div>
    );
  },
});

export default User;
