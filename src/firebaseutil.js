'use strict';

import Firebase from 'firebase';
import React from 'react';
import ReactFireMixin from 'reactfire';

/// <FirebaseValue ref={fb.child('foo')}/> will stay up to date with the scalar
/// value at fb/foo. This exists to deal with reference paths that change.
export let FirebaseValue = React.createClass({
  mixins: [ReactFireMixin],

  propTypes: {
    fbRef: React.PropTypes.instanceOf(Firebase).isRequired,
  },

  componentWillMount() {
    this.bindAsObject(this.props.fbRef, 'value');
  },

  componentWillReceiveProps: function(nextProps) {
    this.unbind('value');
    this.bindAsObject(nextProps.fbRef, 'value');
  },

  render() {
    return <span>{this.state.value['.value']}</span>;
  },
});
