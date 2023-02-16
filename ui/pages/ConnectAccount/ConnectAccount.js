import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { ethErrors } from 'eth-rpc-errors'

import { dappOptionsSelector, listAccountsSelector } from '@selectors/common.selectors'
import { ZButton } from '@components/ZButtons'
import Loader from '@components/Loader'
import { log } from '@shared/util/logger'
import * as actions from '@store/actions'
import './ConnectAccount.scss'
import useToast from '@ui/hooks/useToast'
import AccountList from '@ui/components/AccountList'
import { useTranslation } from 'react-i18next'

function ConnectAccount() {
  const listAccounts = useSelector(listAccountsSelector)
  const dAppOptions = useSelector(dappOptionsSelector)
  const { data, activeTab } = dAppOptions
  const history = useHistory()
  const toast = useToast()
  const { t } = useTranslation()

  const [selectedAccounts, setSelectedAccounts] = useState({})

  const onCancelConnect = () => {
    data
      ? actions.rejectPendingApproval(data.id, ethErrors.provider.userRejectedRequest().serialize())
      : history.goBack()
  }

  const onConnectAccounts = async () => {
    if (data) {
      actions.resolvePendingApproval(data.id, selectedAccounts)
    } else {
      try {
        log({ origin: activeTab.origin, accounts: selectedAccounts })
        await actions.requestPermissions({ origin: activeTab.origin, accounts: selectedAccounts })
        history.goBack()
      } catch (error) {
        toast.error(error.message || 'Something went wrong!')
      }
    }
  }

  const onSelectedListChange = useCallback((newList) => {
    log('onSelectedListChange', newList)
    setSelectedAccounts(newList)
  }, [])

  return (
    <div className="connect-account-page">
      {!listAccounts && <Loader isActive={true} />}
      <div className="title">
        <p>{t('Connect Your Account with')} </p>
        <strong>{data?.origin || activeTab.origin}</strong>
      </div>
      <AccountList
        accounts={listAccounts}
        isShowCheckbox={true}
        selectedListChange={onSelectedListChange}
      />
      <div className="group-btn">
        <ZButton className="secondary" onClick={onCancelConnect}>
          {t('Cancel')}
        </ZButton>
        <ZButton onClick={onConnectAccounts}>{t('Confirm')}</ZButton>
      </div>
    </div>
  )
}

export default ConnectAccount
