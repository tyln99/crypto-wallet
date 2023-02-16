import { log } from '@shared/util/logger'
import React, { useEffect, useState } from 'react'
import './styles.scss'

function ZInputNumber({ initValue = 0, onChange, ...props }) {
  useEffect(() => {
    format(initValue)
  }, [initValue])

  const [displayValue, setDisplayValue] = useState('0')

  const numberWithCommas = (value) => {
    if (value !== '0') {
      value = value.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')

      if (value.indexOf('0.') > 0 || value.indexOf('0.') === -1) {
        value = value.replace(/^0+/, '')
      }
    }
    return value
  }

  const onInputChange = (value) => {
    const number = format(value)
    typeof number !== 'undefined' && onChange && onChange(number)
  }

  const format = (value) => {
    value = value.toString()
    if (value === '') {
      value = '0'
    } else {
      value = value.replace(/,/g, '')
    }
    const number = Number(value)
    if (!isNaN(number)) {
      value = numberWithCommas(value)
      log(value)
      setDisplayValue(value)
      return number
    }
  }

  const handleKeyDown = (event) => {
    // console.log('User pressed: ', event)
    // // console.log(message);
    // if (event.key === 'Enter') {
    //   // 👇️ your logic here
    //   console.log('Enter key pressed ✅')
    // }
  }

  return (
    <input
      className="form-control"
      type="text"
      value={displayValue}
      onChange={(e) => onInputChange(e.target.value)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}

export default ZInputNumber
