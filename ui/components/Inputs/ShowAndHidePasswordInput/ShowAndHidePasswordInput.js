import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import './ShowAndHidePasswordInput.scss'

function ShowAndHidePasswordInput({ changeValue, changeStatus, className }) {
  const [show, setShow] = useState(false)

  const onInputChange = (e) => {
    changeValue(e.target.value)
  }

  const onChangeStatus = () => {
    setShow((prev) => {
      changeStatus(!prev)
      return !prev
    })
  }

  return (
    <div className={`show-and-hide-password-input ${className}`}>
      <input className="form-control" type={show ? 'text' : 'password'} onChange={onInputChange} />
      <div onClick={onChangeStatus} className="button">
        <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
      </div>
    </div>
  )
}

export default ShowAndHidePasswordInput
