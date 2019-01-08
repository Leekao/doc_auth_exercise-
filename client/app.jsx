import React, { Component } from 'react';
import {useTracker} from './useTracker'
import AccountsUIWrapper from './accounts-ui.jsx'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
this.Documents = new Mongo.Collection('documents')
this.InputBoxs = new Mongo.Collection('inputboxs')
this.Chat = new Mongo.Collection('chat')
this.Tokens = new Mongo.Collection('tokens')
this.Requirements = new Mongo.Collection('requirements')
this.Templates = new Mongo.Collection('templates')

import SharedDocument from './document'
import Chatbox from './chatbox'
 
export default class App extends TrackerReact(Component){
  render() {
    const user = Meteor.user()
    if (!user) {
      return  <AccountsUIWrapper />
    }
    return (
      <div>
        <SharedDocument />
        <Chatbox/>
      </div>
    )
  }
} 
