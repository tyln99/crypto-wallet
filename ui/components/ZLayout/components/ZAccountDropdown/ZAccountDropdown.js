import AccountCard from '@components/AccountCard'
import { faEllipsisVertical, faLock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useContext } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'

import { listAccountsSelector } from '@selectors/common.selectors'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedAccount } from '@actions/creator'
import * as actions from '@store/actions'
import { AuthContext } from '@providers/AuthProvider'
import {
  ACCOUNT_ROUTE,
  CREATE_ACCOUNT_ROUTE,
  IMPORT_ACCOUNT_ROUTE,
  LOGIN_ROUTE,
  SETTINGS_ACCOUNT_ROUTE
} from '@shared/constant/routes'
import { ZButton } from '@ui/components/ZButtons'
import plus from '@resources/images/plus.svg'
import language from '@resources/images/language.svg'
import settings from '@resources/images/settings.png'
import expand from '@resources/images/expand.svg'
import download from '@resources/images/download.svg'
import { getEnvironmentType } from '@app/scripts/lib/utils'
import { ENV_TYPE_POPUP } from '@shared/constant/app'
import './ZAccountDropdown.scss'
import { LANGUAGE_CODE, LANGUAGE_CODE_TO_NAME_MAP } from '@shared/constant/language'
import useFetchAccounts from '@ui/hooks/useFetchAccounts'
import useToast from '@ui/hooks/useToast'
const { VI, EN } = LANGUAGE_CODE

function ZAccountDropdown() {
  const history = useHistory()
  const dispatch = useDispatch()
  const listAccounts = useSelector(listAccountsSelector)
  const authContext = useContext(AuthContext)
  const { t, i18n } = useTranslation()
  const fetchAccounts = useFetchAccounts()
  const toast = useToast()

  const onLockWallet = async () => {
    try {
      await authContext.logout(() => {
        fetchAccounts.clearListAccounts()
        fetchAccounts.removeSelectedAccount()
        history.replace(LOGIN_ROUTE)
      })
    } catch (error) {
      toast.error(t(error.message) || t('Something went wrong!'))
    }
  }

  const onSelectAccount = useCallback(async (account) => {
    try {
      await actions.updateZWalletState({ selectedAddress: account.address })
      dispatch(setSelectedAccount(account))
    } catch (error) {}
  }, [])

  const renderSwitchLanguageButton = () => {
    switch (i18n.language) {
      case EN:
        return (
          <div className="option" onClick={() => i18n.changeLanguage(VI)}>
            <img alt="" src={language} />
            <p>{LANGUAGE_CODE_TO_NAME_MAP[EN]}</p>
          </div>
        )

      case VI:
        return (
          <div className="option" onClick={() => i18n.changeLanguage(EN)}>
            <img alt="" src={language} />
            <p>{LANGUAGE_CODE_TO_NAME_MAP[VI]}</p>
          </div>
        )

      default:
        break
    }
  }

  return (
    <Dropdown>
      <Dropdown.Toggle className="setting-btn">
        <FontAwesomeIcon icon={faEllipsisVertical} />
      </Dropdown.Toggle>
      <Dropdown.Menu className="zDropdown-menu accounts-dropdown">
        <h2 className="menu-title">
          {t('Your accounts')}{' '}
          <button className="span-lock" onClick={onLockWallet}>
            <FontAwesomeIcon className="btn-lock" icon={faLock} /> {t('Lock')}
          </button>
        </h2>
        <Dropdown.Item className="list-accounts scrollbar__enabled">
          {listAccounts &&
            listAccounts.map((item, index) => {
              return (
                <AccountCard
                  key={index}
                  onClick={onSelectAccount}
                  balance={item.balance}
                  account={item}
                  isShowCheckbox={false}
                />
              )
            })}
        </Dropdown.Item>
        <Dropdown.Item className="btn-group">
          <ZButton
            className="create-btn secondary"
            onClick={() => history.push(CREATE_ACCOUNT_ROUTE)}
          >
            <img alt="" src={plus} />
            {'  '}
            {t('Create')}
          </ZButton>
          <ZButton className="import-btn" onClick={() => history.push(IMPORT_ACCOUNT_ROUTE)}>
            <img alt="" src={download} />
            {'  '}
            {t('Import')}
          </ZButton>
        </Dropdown.Item>
        <div className="options">
          <div
            className="option"
            onClick={() => {
              if (getEnvironmentType() === ENV_TYPE_POPUP) {
                global.platform.openExtensionInBrowser(SETTINGS_ACCOUNT_ROUTE)
              } else {
                history.push(SETTINGS_ACCOUNT_ROUTE)
              }
            }}
          >
            <img alt="" src={settings} />
            <p>{t('Settings')}</p>
          </div>
          <div
            className="option"
            onClick={() => {
              if (getEnvironmentType() === ENV_TYPE_POPUP) {
                global.platform.openExtensionInBrowser(ACCOUNT_ROUTE)
              }
            }}
          >
            <img alt="" src={expand} />
            <p>{t('Expand view')}</p>
          </div>
          {renderSwitchLanguageButton()}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default ZAccountDropdown
