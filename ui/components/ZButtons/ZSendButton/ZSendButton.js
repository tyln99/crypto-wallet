import React from 'react'
import sendIcon from '@resources/images/send.svg'
import './ZSendButton.scss'

/**
 * @deprecated
 */
function ZSendButton({ text }) {
  return (
    <div className="zSend-button">
      <img alt="" src={sendIcon} />
      <div className="text">{text}</div>
    </div>
  )
}

export default ZSendButton
