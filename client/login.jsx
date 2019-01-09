import React, { Component } from 'react';
import AccountsUIWrapper from './accounts-ui.jsx'
import TrackerReact from 'meteor/ultimatejs:tracker-react';

export default class Login extends TrackerReact(Component){
  render() {
    return  <AccountsUIWrapper />
  }
} 
