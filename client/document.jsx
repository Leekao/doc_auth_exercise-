import React, { Component } from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import InputBox from './inputBox'
import {memo, useState, useEffect, useCallback } from 'react'

const add_input = (input) => {
  InputBoxs.insert(input)
}

const Requirement = (requirement) => {
  const tokens = Tokens.find({document_id:requirement.document_id}).fetch()
  const [mode, setMode] = useState(0)
  const [type, setType] = useState(requirement.type)
  const [name, setName] = useState(requirement.name)
  const [token, setToken] = useState(requirement.token)
  const cls = (requirement.type) ? 'ready' : 'notset'
  return (
    <div className={`requirement ${cls} open-${mode===1}`}>
      {mode===0 && (
        <div className="minimized" onClick={() => setMode(1)}>
          <div className="title"> Requirement </div>
          {!requirement.type && (
            <div className='notset'>Not Set!</div>
          )}
          {requirement.type && (
            <div className='ready'>Ready!</div>
          )}
         </div>
      )}
      {mode===1 && (
        <div className="details">
          <div className='close' onClick={()=> setMode(0)} >X </div>
          <div>Require <select 
            onChange={(e) => setToken(e.currentTarget.value) }
            value={token}
            className="tokens"> 
              {tokens.map((token) => <option key={token._id} value={token._id}>{token.name}</option> )}
            </select>
          </div>
          <div> 
            To Provide: <input 
              defaultValue={'Document Name'}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)} 
              type='text'/>
          </div>
          <div> 
            As: <select 
              className='type'
              value={type}
              onChange={(e) => setType(e.currentTarget.value)}
              >
                <option value='Selfie'>Selfie</option>
                <option value='ID'>ID</option>
              </select>
          </div>
          <div onClick={() => {
            Requirements.update(requirement._id, {
              $set: {
                type, name, token
              }
            })
          }} className='submit'> Save </div>
          <div> 
          </div>
        </div>
      )}
    </div>
  )
}

const Signer = (token) => {
  return (
    <div className={`signer ${token._id}`}>
      <div> {token.name} </div>
      {token.valid && (<div className='valid'>READY</div>)}
    </div>
  )
}
 
export default class SharedDocument extends TrackerReact(Component) {
  render(){
    let doc = Documents.findOne()
    let owner = (doc) ? (doc.owner_id === Meteor.userId()) : false
    if (!doc) {
      doc = {_id:null, base_document:null, tokens:[]}
    }
    const inputs = InputBoxs.find().fetch().map( (e, i) => <InputBox owner={owner} key={e._id} {...e} doc={doc} />)
    const signers = Tokens.find({document_id: doc._id}).fetch().map( (e, i) => <Signer owner={owner} key={e._id} {...e} doc={doc} />)
    const resources = Requirements.find({document_id: doc._id}).fetch().map( (e, i) => <Requirement owner={owner} key={e._id} doc={doc} {...e} />)
    return ( <>
      <div className='session_container'>
        <div className='signers_container'> {signers} </div>
        <div id='document_container' className='document_container'>
          {!doc && <div className=''>No Document</div>}
          {doc && doc.base_document && (
            <img id="base_document" className='base_document' src={doc.base_document} />
          )}
          <div className='inputs_container'>
            {inputs}
          </div>
        </div>
        <div className='resources_container'> {resources} </div>
      </div>
    </>)
  }
}