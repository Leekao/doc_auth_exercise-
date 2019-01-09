import React, { Component } from 'react';
import {memo, useState, useEffect, useCallback } from 'react'

const UploadBase = ({doc, setProgress}) => {
  const current_file = (doc && doc.base_document) ? doc.base_document_filename : null
  return (
    <div className='upload_document'>
      {!current_file && (
        <input type='file' onChange={(e) => {
          const file = e.currentTarget.files[0]
          const reader = new FileReader()
          setProgress(10)
          reader.onload = (e) => {
            setProgress(20)
            if (doc && doc.base_document)
              Documents.update(doc._id, {
                $set: {
                  base_document: e.target.result,
                  base_document_filename: file.name
                }
              })
            else 
              Documents.insert({ 
                base_document: e.target.result,
                base_document_filename: file.name
              })
            setProgress(33)
          }
          reader.readAsDataURL(file)
        }} />
      )}
      {current_file && (
        <div className='filename'>
          {current_file}
          <span onClick={() => {
            return //TODO: fix this
            Documents.update(doc._id, {
              $set: {
                base_document: null,
                base_document_filename: null
              }
            })
          }}> remove </span>
        </div>
      )}
    </div>
  )
}

export const SignerBox = (token) => {
  const [type, setType] = useState('email')
  const [data, setData] = useState(null)
  useEffect( () => {
    const sb = $(`#${token._id}`)
    const si = $(`.${token._id}`)[0]
    sb.css({
      top: si.offsetTop - si.offsetHeight/2, left:si.offsetLeft+si.offsetWidth+10
    })
  })
  return (
    <div className='signerBox' id={token._id}>
      <div className='flexed'>
        <div onClick={ () => setType('email') } 
             className={`email active-${type==='email'}`}
             >Email</div>
        <div onClick={ () => setType('phone') } 
             className={`phone active-${type==='phone'}`}
             >Phone</div>
      </div>
      <div className='details'>
        {type=='email' && (
          <input type='email' value={data} onChange={(e) => setData(e.currentTarget.value)} />
        )}
        {type=='phone' && (
          <input type='phone' value={data} onChange={(e) => setData(e.currentTarget.value)} />
        )}
      </div>
      <div onClick={()=> {
        Tokens.update(token._id, {
          $set: {
            type, data, valid: true, ready_to_lock: false, online: false 
          }
        })
      }} className='submit'> Submit</div>
    </div>
  )
}

export default SessionManager = ({doc, add_input}) => {
  const document_id = (doc) ? doc._id : null
  const default_step = (document_id) ? 1 : 0
  const [step, setStep] = useState(default_step)
  const [session_type, setType] = useState('online')
  const [save, setSave] = useState(false)
  const [progress, setProgress] = useState(0)
  const [flow, setFlow] = useState('joined')
  const steps = ['Create', 'Edit', 'Invite']
  const tokens = Tokens.find({document_id}).fetch()
  const inputs = InputBoxs.find({document_id}).fetch()
  const res_rq = Requirements.find({document_id}).fetch()
  const templates = Templates.find().fetch()
  let signer_boxs = []
  useEffect( () => {
    let p = 0
    if (document_id)
      p += 33
    else
      return
    if (doc.tokens && doc.tokens.length > 0 && 
        doc.input_requirements && doc.input_requirements.length > 1 &&
        inputs.filter(i => !i.assigned_to).length == 0 )
          p += 33
    if (tokens.filter(t => !t.valid).length == 0 &&
        inputs.filter(i => !i.assigned_to).length == 0 && 
        res_rq.filter(r => !r.type).length == 0)
          p+=33
    setProgress(p)
  }, [doc])
  switch (step) {
    case 2:
      signer_boxs = Tokens
      .find({_id: {$in: doc.tokens}})
      .fetch()
      .filter((t) => !t.valid)
      .map((t) => <SignerBox key={t._id} {...t} />)
      break
  }
  const style= {
    width: progress+'%'
  }
  const done = (doc && doc.tokens)
    ? (doc.tokens.length > 0) && (signer_boxs.length === 0)
    : false
  return (
    <div className='session_manager'>
      <div className='steps_container'>
        <div onClick={() => setStep(0)}
             className={`step selected-${step===0}`}
         >1. Create</div>
        <div onClick={() => document_id && setStep(1)} 
             className={`step selected-${step===1} disabled-${!document_id}`}
         >2. Prepare</div>
        <div onClick={() => document_id && setStep(2)} 
             className={`step selected-${step===2} disabled-${!document_id}`}
         >3. Send</div>
      </div>
      <div className='progress'>
        <div style={style}> </div>
      </div>
      {step===0 && (
        <div className='create'>
          <div className="from">
            From Template
            <select> 
              <option>default</option>
            </select>
          </div>
          <div className="from">
            From File <UploadBase setProgress={setProgress} doc={doc} />
          </div>
          <div className="from">
            From History
            <select> 
              <option>default</option>
            </select>
          </div>
        </div>
      )}
      {step===1 && (
        <ButtonsContainer document_id={document_id} add_input={add_input} />
      )}

      {step===2 && (
        <div className='session_setup'>
          <div onChange={(e) => {setType(e.target.value)}} className="session_type">
            Session Type: 
            <input type="radio" id="offline" name="type" value="offline" />
            <label htmlFor="offline">Offline</label>
            <input type="radio" id="online" name="type" value="online" />
            <label htmlFor="online">Online</label>
          </div>
          <div className="flow">
            Signers Sign Simultaneously: 
            <input type="radio" id="joined" name="type" value="joined" />
            <label htmlFor="joined">Yes</label>
            <input type="radio" id="inflow" name="type" value="inflow" />
            <label htmlFor="inflow">No</label>
          </div>
          <div onChange={(e) => {setSave(e.target.value)}} className="save">
            <input type="checkbox" id="save" name="type" value={save} />
            <label htmlFor="save">Save As Template</label>
          </div>
          <div className='session_tokens'>
            {signer_boxs}
            <div className='Continue'>
             {!done && ( 
              <div> 
                {(doc.tokens.length - signer_boxs.length)} / {doc.tokens.length} Invites Ready
              </div>)}
             {done && (
              <div className="submit"
                   onClick={() => {
                    if (save) 
                      Meteor.call('save as template', document_id)
                    Meteor.call('send invitation', document_id)
                   }}
              >GO</div
              >)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const ButtonsContainer = ({document_id, add_input}) => {
  const [isPressed, setPressed] = useState(false)
  const [type, setType] = useState(null)
  const [firstMousePos, setFirstMousePos] = useState(null)
  const [secondMousePos, setSecondMousePos] = useState(null)
  const doc = Documents.findOne(document_id)
  switch (true) {
    case !doc:
    case !doc.base_document:
      return <div> erez </div>
  }
  if (!doc) return <div>Upload a base document</div>
  useEffect(()=> {
    const base_doc = $('#base_document')
    if (!base_doc) return
    $('#hitbox').css({
      top: base_doc.offset().top,
      left: base_doc.offset().left,
      height: base_doc.height(),
      width: base_doc.width()
    })
  },[isPressed])
  let style
  if (firstMousePos) {
    style = {
      left: firstMousePos[0],
      top: firstMousePos[1] - 5,
    }
    if (secondMousePos) {
      style = Object.assign(style, {
        width: secondMousePos[0] - firstMousePos[0],
        height: secondMousePos[1] - firstMousePos[1] -5
      })
    }
  }
  return (
    <div className='edit_session'>
      <div className='buttons_container'
           onClick={e => (isPressed===true) ? setPressed(false) : setPressed(true)}
        >
        <div className='add_signer' onClick={(e) => {
          e.stopPropagation()
          const new_token = Tokens.insert({ document_id, name: `Signer${doc.tokens.length+1}`})
          Documents.update(document_id, { $push: {tokens: new_token} })
        }}>
          ADD SIGNER
        </div>
        <div className='add_signature' 
             onClick={e => (type === 'signature') ? setType(null) : setType('signature')}
          >
        <i className="fas fa-signature"></i> Signature
        </div>
        <div className='add_stamp' onClick={(e) => { setType('stamp') }}>
        <i className="fas fa-stamp"></i> Stamp
         </div>
        <div className='add_textarea' onClick={(e) => { setType('text') }}> 
        <i className="fas fa-font"></i>
          Text
        </div>
        <div className='add_requirement' onClick={(e) => { 
          e.stopPropagation()
          const new_requirement = Requirements.insert({ document_id })
          Documents.update(document_id, { $push: {resource_requirements: new_requirement} })
         }}>
          ADD REQUIREMENT 
        </div>
      </div>
      {isPressed && (
        <div id='hitbox' className='hitbox'
          onMouseMove= { (e) => {
            if (!firstMousePos) return
            const offset = $('#document_container').offset()
            const x = e.pageX - offset.left
            const y = e.pageY - offset.top 
            setSecondMousePos([x, y])
          }}
          onClick={(e) => {
            if (firstMousePos) {
              const position = [firstMousePos[0], firstMousePos[1] - 5]
              const size = [secondMousePos[0] - firstMousePos[0] , secondMousePos[1] - firstMousePos[1] - 5]
              const signer = (doc.tokens.length > 0) ? doc.tokens[0] : null
              add_input({
                document_id, position, size, type, signer
              })
              setType(null)
              setFirstMousePos(null)
              setSecondMousePos(null)     
              setPressed(false)
              return
            }
            const px = e.pageX
            const py = e.pageY
            const offset = $('#document_container').offset()
            const x = px - offset.left
            const y = py - offset.top
            setFirstMousePos([x, y])
          }}
        >
        {firstMousePos && (
          <div className='marker' style={style} ></div>
        )}
        </div>
      )}
    </div>
  )
}