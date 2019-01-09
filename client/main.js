import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
 
import App from './app.jsx';

FlowRouter.route('/', {
  action(params) {
    Meteor.subscribe(true)
    render(<App />, document.getElementById('render-target'));
  }
})

FlowRouter.route('/login', {
  action(params) {
    render(<Login />, document.getElementById('render-target'));
  }
})
FlowRouter.route('/edit/:document_id', {
  action(params) {
    Meteor.subscribe('document', params.token)
    render(<App {...params} edit={true} />, document.getElementById('render-target'));
  }
})

FlowRouter.route('/session/:document_id', {
  action(params) {
    Meteor.subscribe('document', params.token)
    render(<App {...params} />, document.getElementById('render-target'));
  }
})

FlowRouter.route('/session/:document_id/:token', {
  action(params) {
    Meteor.subscribe('token', params.token)
    render(<App user={'guest'} {...params} />, document.getElementById('render-target'));
  }
})