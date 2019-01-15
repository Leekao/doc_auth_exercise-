import Konva, { FastLayer } from 'konva'
import { Component } from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import React, { memo, useState, useEffect, useCallback } from 'react'

const SignatureBox = ({document_id, assigned_to, owner, value, _id}) => {
  const [isActive, setActive] = useState(false)
  const [popup, setPopup] = useState(false)
  let saveFunction = null
  let onDelete = null
  if (isActive) {
    setTimeout( () => {
      const stage = new Konva.Stage({
        width: window.innerWidth / 2,
        height: window.innerHeight / 2,
        container: 'canvas_container'
      })
      const canvas = document.createElement('canvas')
      canvas.width = stage.getWidth()
      canvas.height = stage.getHeight()
      const cntxt = canvas.getContext('2d')
      cntxt.strokeStyle = 'blue'
      cntxt.lineJoin = 'round'
      cntxt.lineWidth = 5
      cntxt.globalCompositeOperation = 'source-over'
      let mouseDown = false
      let pointer_pos
      const layer = new Konva.Layer()
      const frame = new Konva.Image({
        x: 0, y: 0, width: stage.getWidth(), height: stage.getHeight(), image: canvas
      })
      frame.on('mousedown touchstart', (e) => {
        mouseDown = true
        pointer_pos = stage.getPointerPosition()
      })
      stage.addEventListener('mouseup touchend', () => {
        mouseDown = false
      })

      stage.addEventListener('mousemove touchmove', () => {
        if (!mouseDown) return
        cntxt.beginPath()
        const local_pos = {
          x: pointer_pos.x - frame.x(),
          y: pointer_pos.y - frame.y()
        }
        cntxt.moveTo(local_pos.x, local_pos.y)
        const pos = stage.getPointerPosition()
        cntxt.lineTo(pos.x, pos.y)
        cntxt.closePath()
        cntxt.stroke()
        pointer_pos = pos
        layer.batchDraw()
      })
      layer.add(frame)
      stage.add(layer)
      saveFunction = () => {
        return stage.toDataURL()
      }
      onDelete = () => {
        stage.destroy()
      }
      return
    },0)
  }
  let signers = []
  let assigned = null
  if (!assigned_to) {
    signers = Tokens
    .find({document_id})
    .map((t) => {
      return (
        <div key={t._id} 
             className='assignable_signer'
             onClick={(e) => {
               InputBoxs.update(_id, {
                 $set: {
                  assigned_to: t._id
                 }
               })
             }}
             >{t.name}</div>
      )
    })
  } else {
    assigned = Tokens.findOne(assigned_to).name
  }
  return (
    <div onClick={(e) => {
      if (owner) {
        setPopup(true)
        return
      }
      if (!isActive)
        setActive(true)
    }} className={`signature_box assignable-${!assigned_to}`}>
    {!assigned_to && (
      <div className="assignable_signers"
           onClick={(e) => {
             e.stopPropagation()
           }}
      >{signers} </div>
    )}
    {(assigned_to && !value) && (
      <div className='watermark'> {assigned} </div>
    )}
    {value && (
      <img src={value} className='value' />
    )}
    {popup && (
      <div className='modal'>
        <div className='close'>X</div>
        <div className='details'>erez</div>
        <div className='submit' onClick={() => {
        }}> Done </div>
       </div>
    )}
    {isActive && (
      <div className='modal'>
        <div className='close'>X</div>
        <div id='canvas_container'></div>
        <div className='submit' onClick={() => {
          const $set = {value: saveFunction()}
          onDelete && onDelete()
          setActive(false)
          InputBoxs.update(_id, {$set})
        }}> Done </div>
       </div>
    )}
    </div>
  )
}

const InputDetails = () => {

}
 
export default InputBox = ({document_id, assigned_to, owner, size, type, value, position, _id}) => {
  let input
  const style = {
    left: position[0],
    top: position[1],
    height: size[1],
    width: size[0],
  }
  switch (type) {
    case "signature":
      input = (<SignatureBox _id={_id} assigned_to={assigned_to} document_id={document_id} owner={owner} value={value} />)
      break;
  }
  return (
    <div style={style} data-id={_id} className='input_container'>
      {input}
    </div>
  )
}