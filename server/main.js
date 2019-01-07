import { Meteor } from 'meteor/meteor'
//import {jsPDF} from 'jspdf'
//console.log(jsPDF)
const Documents = new Mongo.Collection('documents')
const InputBoxs = new Mongo.Collection('inputboxs')
const Chats = new Mongo.Collection('chat')
const Tokens = new Mongo.Collection('tokens')
const Requirements = new Mongo.Collection('requirements')
const Templates = new Mongo.Collection('templates')

const save = () => {
  //const doc = Documents.findOne()
  //const input = InputBoxs.findOne()
  //const pdf = new jsPDF('p','pt')
  //pdf.addImage(doc.base_document, '', 0, 0)
  //pdf.addImage(input.value, '', input.position[0], input.position[1], input.size[0], input.size[1])
  //pdf.save('test.pdf')
}

const basic_document = {
  resource_requirements: [],
  tokens: [],
  input_requirements: [],
  options: {}, 
  active: true
}

Meteor.methods({
  'save as template': (document_id) => {
    const doc = Documents.findOne(document_id)
    doc.document_id = doc._id
    delete doc._id
    Templates.insert(doc)
  },
  'send invitation': (document_id) => {

  }
})

Meteor.publish('token', (token) => {
  const _token = Tokens.findOne(token)
  
  if (_token)
    return [
      Documents.find(_token.document_id),
      InputBoxs.find(_token.document_id),
      Requirements.find(_token.document_id),
    ] 
})

InputBoxs.allow({
  insert(userId, doc) {
    const document = Documents.findOne(doc.document_id)
    if (userId === document.owner_id) {
      return true
    }
    return false
  },
  update(userId, doc, fields, {$push, $set}){
    const document = Documents.findOne(doc.document_id)
    if (userId === document.owner_id) {
      return true
    }
    return !!$set
  }
})

Documents.allow({
  insert(userId, doc) {
    if (1==2) return false
    Meteor.defer( () => {
      let document = {
        created_at: new Date().valueOf(),
        owner_id: userId,
        ...basic_document,
      }
      Documents.update(doc._id, {
        $set: {...document}
      })
      Chats.insert({ document_id: doc._id, history: [] })
    })
    return true
  },

  update(userId, doc, fields, {$push, $set}) {
    // make sure userId is in tokens or owner_id
    if(fields[0] === 'tokens' && fields.length === 1) {
      return $push && !$set
    }
    if(fields[0] === 'resource_requirements' && fields.length === 1) {
      return $push && !$set
    }
    return true
  },
  remove(userId, doc) {
    return userId===doc.owner_id
  }
})

const reset_db = () => {
  Documents.remove({})
  InputBoxs.remove({})
  Tokens.remove({})
  Chats.remove({})
  return
}

Meteor.methods({
  reset_db, save
})

Meteor.startup(() => {
  reset_db()
})