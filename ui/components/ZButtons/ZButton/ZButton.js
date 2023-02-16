import React from 'react'
import { Button } from './styled'

function ZButton({ children, ...props }) {
  return <Button {...props}>{children}</Button>
}

export default ZButton
