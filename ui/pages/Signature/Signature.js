import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'

import {
  selectedAccountSelector,
  selectedNetworkSelector,
  dappOptionsSelector
} from '@selectors/common.selectors'
import { ZButton } from '@components/ZButtons'
import { formatAddress, formatBalance } from '@shared/util/string'
import * as actions from '@store/actions'
import './styles.scss'
import { ethErrors } from 'eth-rpc-errors'
import { useTranslation } from 'react-i18next'

function Signature() {
  const { t } = useTranslation()
  const selectedNetwork = useSelector(selectedNetworkSelector)
  const selectedAccount = useSelector(selectedAccountSelector)
  const dAppOptions = useSelector(dappOptionsSelector)
  const { data } = dAppOptions
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (data) {
      setMessage(data.requestData.message)
    }
  }, [data])

  const signMessage = async () => {
    await actions.resolvePendingApproval(data.id, { account: selectedAccount })
  }

  const onCancelSign = async () => {
    await actions.rejectPendingApproval(
      data.id,
      ethErrors.provider.userRejectedRequest().serialize()
    )
  }

  return (
    <>
      {selectedNetwork && selectedAccount && (
        <div className="signature-page">
          <header className="header">
            <span>{formatAddress(selectedAccount.address)}</span>
            <span>{selectedNetwork.name}</span>
          </header>
          <div className="title">{t('Signature Request')}</div>
          <div className="main">
            <div className="account-info">
              <p className="address">
                {t('Account')}: {formatAddress(selectedAccount.address)}
              </p>
              <p className="balance">
                {t('Balance')}:{' '}
                {formatBalance(selectedAccount.balance || 0, selectedNetwork.currency)}
              </p>
              <br />
            </div>
            <main>
              <div className="tx-center signing-message-text">{t('Signing message')}</div>
              <textarea
                rows="5"
                defaultValue={message}
                disabled
                className="message-container form-control"
              />
            </main>
            <div className="group-btn">
              <ZButton className="secondary" onClick={onCancelSign}>
                {t('Cancel')}
              </ZButton>
              <ZButton disabled={selectedAccount ? false : true} onClick={signMessage}>
                {t('Sign')}
              </ZButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Signature
