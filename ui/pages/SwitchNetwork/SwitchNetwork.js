import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectedNetworkSelector, dappOptionsSelector } from '@selectors/common.selectors'
import { ZButton } from '@components/ZButtons'
import Loader from '@components/Loader'
import * as actions from '@store/actions'
import { ethErrors } from 'eth-rpc-errors'
import { setSelectedNetwork } from '@actions/creator'
import './SwitchNetwork.scss'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'

function SwitchNetwork() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const selectedNetwork = useSelector(selectedNetworkSelector) || {}
  const dAppOptions = useSelector(dappOptionsSelector)
  const { data } = dAppOptions
  const { requestData, origin } = data

  const onCancelSwitchNetwork = async () => {
    await actions.rejectPendingApproval(
      data.id,
      ethErrors.provider.userRejectedRequest().serialize()
    )
  }

  const onConfirm = async () => {
    await actions.resolvePendingApproval(data.id, data.requestData)
    dispatch(setSelectedNetwork(data.requestData))
  }

  return (
    <>
      {!selectedNetwork && <Loader />}
      {selectedNetwork && (
        <div className="switch-network-page">
          <main>
            <div className="current-network">
              <FontAwesomeIcon className="icon active" icon={faCircle} />
              {selectedNetwork.name}
            </div>
            <div className="origin">{origin}</div>
            <h2 className="title">{t('Allow this site to switch the network')}?</h2>
            <p className="description">
              {t('This will switch the selected network to the network')}:{' '}
            </p>
            {requestData && (
              <>
                <div className="new-network">
                  <div className="info">
                    <div className="info-title">{t('Network name')}:</div>
                    <span className="data fw-bold">{requestData.name}</span>
                  </div>
                  <div className="info">
                    <div className="info-title">{t('Rpc url')}:</div>
                    <span className="data fw-bold rpc-url">
                      <p>{requestData.rpcUrl}</p>
                    </span>
                  </div>
                  <div className="info">
                    <div className="info-title">{t('Chain id')}:</div>
                    <span className="data fw-bold">{Number(requestData.chainId)}</span>
                  </div>
                  <div className="info">
                    <div className="info-title">{t('Currency')}:</div>
                    <span className="data fw-bold">{requestData.currency}</span>
                  </div>
                </div>

                {Number(requestData.chainId) === Number(selectedNetwork.chainId) && (
                  <div className="alert alert-warning" role="alert">
                    {t('Current network is the same')}!
                  </div>
                )}
              </>
            )}
          </main>
          <div className="group-btn">
            <ZButton className="secondary" onClick={onCancelSwitchNetwork}>
              {t('Cancel')}
            </ZButton>
            <ZButton onClick={onConfirm}>{t('Switch network')}</ZButton>
          </div>
        </div>
      )}
    </>
  )
}

export default SwitchNetwork
