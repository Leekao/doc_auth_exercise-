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
import Login from './login'
 
import SessionManager from './session_manager'

export default class App extends TrackerReact(Component){
  render() {
    const user = Meteor.user()
    const {edit, token, document_id} = this.props
    const doc = Documents.find(document_id).fetch()[0]
    if (document_id && token) {
      return (
        <div>
          <SharedDocument document_id={document_id} />
          <Chatbox/>
        </div>
      )
    }
    if (!user) {
      return <Login />
    }
    if (document_id) {
      if (doc) {
        console.log('got document')
        if (doc.owner_id == user._id) {
          console.log('user is owner')
          return (
            <div>
              <SessionManager owner={edit} doc={doc} />
              <SharedDocument document_id={document_id} />
              <Chatbox/>
            </div>
          )
        }
      }
    }
    console.log('user isnt owner')
    return (
      <div>
        <SessionManager owner={edit} document_id={document_id} />
        <SharedDocument />
        <Chatbox/>
      </div>
    )
  }
} 
