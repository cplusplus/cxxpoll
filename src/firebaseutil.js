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

import Firebase from 'firebase';
import React from 'react';
import ReactFireMixin from 'reactfire';

import { firebaseRoot } from './config';

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

  componentWillReceiveProps(nextProps) {
    if (this.props.fbRef !== nextProps.fbRef) {
      this.unbind('value');
      this.bindAsObject(nextProps.fbRef, 'value');
    }
  },

  _getValue() {
    return (this.state && this.state.value && this.state.value['.value']) || '';
  },

  render() {
    return <span>{this._getValue()}</span>;
  },
});

export let AuthStateMixin = {
  componentWillMount() {
    firebaseRoot.onAuth(this._AuthStateMixin_onAuth, this);
  },
  componentWillUnmount() {
    firebaseRoot.offAuth(this._AuthStateMixin_onAuth, this);
  },

  _AuthStateMixin_onAuth(auth) {
    this.setState({auth: auth});
    if (this.onAuth) {
      this.onAuth(auth);
    }
  },
};
