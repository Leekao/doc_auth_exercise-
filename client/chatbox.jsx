import React, { Component } from 'react';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

const Chatline = ({data}) => {
  console.log(2)
  return <div>{data}</div>
}

export default class ChatBox extends TrackerReact(Component) {
  constructor() {
    super()
    this.input = React.createRef()
  }
  render() {
    let doc, chat
    doc = Documents.find().fetch()[0]
    if (doc) {
      chat = Chat.find({document_id: doc._id}).fetch()[0]
    }
    if (!chat) {
      return <div>No Active Chat</div>
    }
    let innerValue = ""
    const history = chat.history.map((e) => {
      return (
        <Chatline key={e[0]} data={e[1]} />
      )
    })
    return (
      <div className='chat_container'>
        <div className ='history'>
          {history}
        </div>
        <div className="input">
          <form target="" onSubmit={ (e) => {
            const {_id} = chat
            e.preventDefault()
            const el = this.input.current
            const history = [new Date().valueOf(), el.value]
            const $push = {history}
            Chat.update({_id}, {$push})
            el.value = ''
          }}>
            <input ref={this.input} type="text" onKeyPress={(e) => {
              const el = e.currentTarget
              innerValue = el.value
            }} />
          </form>
        </div>
      </div>
    )
  }
} 