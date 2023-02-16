import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router'
import Sidebar from './Sidebar'
import './Settings.scss'
import {
  ACCOUNT_ROUTE,
  SETTINGS_ACCOUNT_ROUTE,
  SETTINGS_CONTACT_ROUTE,
  SETTINGS_NETWORK_ROUTE,
  SETTINGS_PRIVACY_ROUTE
} from '@shared/constant/routes'
import NetworksSetting from './Network'
import logo from '@resources/images/logo_yellow.svg'
import { Link } from 'react-router-dom'
import AccountSetting from './Account'
import ContactSetting from './Contact'
import { useTranslation } from 'react-i18next'
import Footer from '@components/ZLayout/Footer'
import PrivacySetting from './Privacy'

function Settings() {
  let { path } = useRouteMatch()
  const { t } = useTranslation()

  const renderContent = () => {
    return (
      <>
        <div className="setting-header">
          <Link to={ACCOUNT_ROUTE}>
            <img alt="" className="avatar left" src={logo} />
          </Link>
          <h2 className="title">{t('Settings')}</h2>
          <span className="flex-item"></span>
        </div>
        <main>
          <Sidebar />
          <div className="settings-content">
            <Switch>
              <Route exact path={path}>
                <NetworksSetting />
              </Route>
              <Route path={SETTINGS_NETWORK_ROUTE}>
                <NetworksSetting />
              </Route>
              <Route path={SETTINGS_ACCOUNT_ROUTE}>
                <AccountSetting />
              </Route>
              <Route path={SETTINGS_CONTACT_ROUTE}>
                <ContactSetting />
              </Route>
              <Route path={SETTINGS_PRIVACY_ROUTE}>
                <PrivacySetting />
              </Route>
            </Switch>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return <div className="settings-page">{renderContent()}</div>
}
export default Settings
