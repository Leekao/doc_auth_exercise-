import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
 
import App from './app.jsx';
FlowRouter.route('/', {
  action(params) {
    render(<App />, document.getElementById('render-target'));
  }
})

FlowRouter.route('/tokens/:token', {
  action(params) {
    Meteor.subscribe('token', params.token)
    render(<App />, document.getElementById('render-target'));
  }
})