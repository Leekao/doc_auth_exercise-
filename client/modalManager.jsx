import React, { Component } from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import InputBox from './inputBox'
 
export default class ModalManager extends TrackerReact(Component) {
  render() {
    const doc = Documents.findOne()
    const inputs = doc.inputs.map( (e, i) => <InputBox key={e.uuid} {...e} />)
    console.log(doc)
    return (
      <div className='imagebackground'>
      {inputs}
      </div>
    )
  }
}