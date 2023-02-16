import React from 'react'
import NumberFormat from 'react-number-format'
import './styles.scss'

function ZNumberFormat({ value, currency }) {
  return (
    <NumberFormat
      displayType={'text'}
      thousandSeparator={true}
      value={value}
      suffix={currency ? ` ${currency}` : ''}
    />
  )
}

export default ZNumberFormat
