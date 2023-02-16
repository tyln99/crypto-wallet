import React from 'react'
import { DarkBackground } from './styled'
import './Loader.scss'

function Loader({ isActive }) {
  return (
    <DarkBackground appear={isActive}>
      <div className="loading-spin">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </DarkBackground>
  )
}

export default Loader
