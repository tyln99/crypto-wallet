import React from 'react'
import Tippy from '@tippyjs/react'
import './styles.scss'
import 'tippy.js/dist/tippy.css' // optional

function ZTooltip({
  children,
  hideOnClick = false,
  placement = 'bottom',
  content = 'Tooltip',
  disabled,
  onShow
}) {
  return (
    <Tippy
      className={'zTippy-tooltip'}
      hideOnClick={hideOnClick}
      disabled={disabled}
      placement={placement}
      content={content}
      onShow={onShow}
    >
      {children}
    </Tippy>
  )
}

export default ZTooltip
