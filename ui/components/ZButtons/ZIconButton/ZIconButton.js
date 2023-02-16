import React from 'react'
import './ZIconButton.scss'

function ZIconButton({ text, icon, onClick = () => {} }) {
  return (
    <div className="z-icon-button" onClick={onClick}>
      <img alt="" src={icon} />
      <div className="text">{text}</div>
    </div>
  )
}

export default ZIconButton
