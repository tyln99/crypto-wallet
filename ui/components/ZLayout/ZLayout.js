import React, { useContext } from 'react'
import { Toaster } from 'react-hot-toast'
import { Link, useLocation } from 'react-router-dom'

import logo from '@resources/images/logo_yellow.svg'
import ZAccountDropdown from './components/ZAccountDropdown'
import ZNetworkDropdown from './components/ZNetworkDropdown'
import { Body, Header } from './styled'
import './ZLayout.scss'
import {
  ACCOUNT_ROUTE,
  COIN_ROUTE,
  CONNECT_ACCOUNT_ROUTE,
  CREATE_ACCOUNT_ROUTE,
  EDIT_ACCOUNT_ROUTE,
  IMPORT_ACCOUNT_ROUTE,
  IMPORT_NFT_ROUTE,
  IMPORT_TOKEN_ROUTE,
  ROOT_ROUTE,
  SEND_COIN_ROUTE,
  SEND_TOKEN_ROUTE,
  TOKEN_ROUTE
} from '@shared/constant/routes'
import { logCount } from '@shared/util/logger'
import { useSelector } from 'react-redux'
import { dappOptionsSelector } from '@selectors/common.selectors'
import { isNull } from 'lodash'
import Loader from '../Loader'

const showHeaderPaths = [
  ROOT_ROUTE,
  ACCOUNT_ROUTE,
  SEND_TOKEN_ROUTE,
  SEND_COIN_ROUTE,
  EDIT_ACCOUNT_ROUTE,
  CONNECT_ACCOUNT_ROUTE,
  CREATE_ACCOUNT_ROUTE,
  IMPORT_ACCOUNT_ROUTE,
  TOKEN_ROUTE,
  COIN_ROUTE,
  IMPORT_TOKEN_ROUTE,
  IMPORT_NFT_ROUTE
]

const ZLayout = ({ children }) => {
  const dappOptions = useSelector(dappOptionsSelector)
  const location = useLocation()
  logCount('[debug] ZLayout rerender')

  return (
    <>
      {isNull(dappOptions) && <Loader isActive={true} />}
      {!isNull(dappOptions) && (
        <div className="app-container">
          <Header
            className={`app-header ${!showHeaderPaths.includes(location.pathname) && 'hidden'}`}
          >
            <Link to={ACCOUNT_ROUTE}>
              <img alt="" className="avatar" src={logo} />
            </Link>
            <div className="header-setting">
              <ZNetworkDropdown />
              <ZAccountDropdown />
            </div>
          </Header>
          <Body className="main-container">{children}</Body>
        </div>
      )}
      <Toaster />
    </>
  )
}

export default ZLayout
