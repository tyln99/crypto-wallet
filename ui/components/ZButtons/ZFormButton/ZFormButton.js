import React from 'react'
import './styles.scss'

function ZFormButton({
  text = 'ZButton',
  variant = 'primary',
  disabled = false,
  onClick,
  ...props
}) {
  return (
    <button {...props} className={`zForm-button ${variant}`} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  )
}

export default ZFormButton
