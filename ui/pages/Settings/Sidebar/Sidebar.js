import {
  SETTINGS_ACCOUNT_ROUTE,
  SETTINGS_CONTACT_ROUTE,
  SETTINGS_NETWORK_ROUTE,
  SETTINGS_PRIVACY_ROUTE,
  SETTINGS_ROUTE
} from '@shared/constant/routes'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.scss'

function Sidebar() {
  let location = useLocation()
  const { t } = useTranslation()

  return (
    <div className="sidebar">
      <Link
        className={
          location.pathname === SETTINGS_NETWORK_ROUTE || location.pathname === SETTINGS_ROUTE
            ? 'active'
            : ''
        }
        to={SETTINGS_NETWORK_ROUTE}
      >
        {t('Networks')}
      </Link>
      <Link
        className={location.pathname === SETTINGS_ACCOUNT_ROUTE ? 'active' : ''}
        to={SETTINGS_ACCOUNT_ROUTE}
      >
        {t('Account')}
      </Link>
      <Link
        className={location.pathname === SETTINGS_CONTACT_ROUTE ? 'active' : ''}
        to={SETTINGS_CONTACT_ROUTE}
      >
        {t('Contact')}
      </Link>
      <Link
        className={location.pathname === SETTINGS_PRIVACY_ROUTE ? 'active' : ''}
        to={SETTINGS_PRIVACY_ROUTE}
      >
        {t('Security & Privacy')}
      </Link>
    </div>
  )
}

export default Sidebar
