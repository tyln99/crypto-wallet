import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useSelector } from 'react-redux'

import { selectedAccountSelector, dappOptionsSelector } from '@selectors/common.selectors'
import { ZButton } from '@components/ZButtons'
import { formatAddress } from '@shared/util/string'
import { calculateTransactionFee } from '@shared/util/calculator'
import ZTooltip from '@components/ZTooltip'
import { log, logErr } from '@shared/util/logger'
import * as actions from '@store/actions'
import { ethErrors } from 'eth-rpc-errors'
import { parseStandardTokenTransactionData } from '@shared/util/transaction.util'
import { toHex } from 'web3-utils'
import { toWei } from '@shared/util/converter'
import { UNITS } from '@shared/constant/app'
import { CONTRACT_METHOD } from '../../../shared/constant/app'
import { fromWei } from '../../../shared/util/converter'
import './RequestSendTransaction.scss'
import arrowRight from '@resources/images/arrow_right.svg'
import Loader from '@ui/components/Loader'
import { t } from 'i18next'

function RequestSendTransaction() {
  const selectedAccount = useSelector(selectedAccountSelector)
  const dAppOptions = useSelector(dappOptionsSelector)
  const { data } = dAppOptions
  const { requestData, origin } = data

  const [errorMessage, setErrorMessage] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [isDisable, setIsDisable] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [txInfo, setTxInfo] = useState()
  const [txDetails, setTxDetails] = useState({})
  const [gasLimit, setGasLimit] = useState()
  const [gasPrice, setGasPrice] = useState()
  const [tokenTxDescription, setTokenTxDescription] = useState()
  const [currentNetwork, setCurrentNetwork] = useState()

  useEffect(() => {
    const fetchCurrentNetwork = async () => {
      try {
        const network = await actions.getNetwork()
        log('network', network)
        setCurrentNetwork(network)
      } catch (error) {}
    }
    fetchCurrentNetwork()
    log('data', data)
    if (data) {
      getGasPrice()
      estimateGas(requestData)
      setTxInfo(requestData)
      getContractMethodData(requestData.to, requestData.data)
    }
  }, [])

  const getContractMethodData = async (to, data) => {
    setIsLoading(true)
    try {
      const { contractCode, isContractAddress } = await actions.readAddressAsContract(to)
      if (isContractAddress) {
        const tokenTxData = await parseStandardTokenTransactionData(data)
        if (tokenTxData.name) {
          // send token
          log('tokenTxData', tokenTxData)
          setTokenTxDescription(tokenTxData)
        } else {
          tokenTxData.name = CONTRACT_METHOD.INTEGRATION
          setTokenTxDescription({ name: CONTRACT_METHOD.INTEGRATION })
        }

        const details = {
          type: 'token',
          method: tokenTxData.name,
          from: requestData.from.toLowerCase(),
          to: requestData.to.toLowerCase(),
          amount: null
        }
        try {
          const details = await actions.getTokenStandardAndDetails({
            tokenAddress: requestData.to,
            userAddress: requestData.from
          })
          txDetails.currency = details.symbol
        } catch (error) {
          txDetails.currency = '' // default symbol
          logErr({ error, data: { to, data } })
        }
        setTxDetails(details)
      }
    } catch (error) {}

    setIsLoading(false)
  }

  const estimateGas = async (requestData) => {
    try {
      const gas = await actions.estimateGas(requestData)
      setGasLimit(gas + 10000)
    } catch (error) {}
  }

  const getGasPrice = async () => {
    try {
      const gasPrice = await actions.getGasPrice()
      setGasPrice(gasPrice)
    } catch (error) {}
  }

  const onCancel = async () => {
    await actions.rejectPendingApproval(
      data.id,
      ethErrors.provider.userRejectedRequest().serialize()
    )
  }

  const onSubmit = async () => {
    await actions.resolvePendingApproval(data.id, {
      txDetails: txDetails,
      estimatedGas: toHex(gasLimit),
      newGasPrice: toHex(toWei(gasPrice, UNITS.GWEI)),
      account: selectedAccount
    })
  }

  const copyAddress = (txt) => {
    navigator.clipboard.writeText(txt)
    setIsCopied(!isCopied)
  }

  return (
    <>
      <Loader isActive={isLoading} />
      {selectedAccount && currentNetwork && txInfo && (
        <div className="request-send-transaction-page">
          <header className="header">
            <span>{formatAddress(selectedAccount.address)}</span>
            <span>{currentNetwork.name}</span>
          </header>
          <main>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <section className="money-direction">
              <ZTooltip
                content={isCopied ? t('Copied') : t('Copy to clipboard')}
                onShow={() => {
                  setIsCopied(false)
                  return true
                }}
                placement="bottom"
              >
                <strong onClick={() => copyAddress(txInfo.from)}>
                  {formatAddress(txInfo.from)}
                </strong>
              </ZTooltip>
              &nbsp;&nbsp;
              <img alt="" src={arrowRight} />
              &nbsp;&nbsp;
              <ZTooltip
                content={isCopied ? t('Copied') : t('Copy to clipboard')}
                onShow={() => {
                  setIsCopied(false)
                  return true
                }}
                placement="bottom"
              >
                <strong onClick={() => copyAddress(txInfo.to)}>{formatAddress(txInfo.to)}</strong>
              </ZTooltip>
            </section>
            {tokenTxDescription ? ( // confirm contract interaction
              <section className="action-info">
                <p className="origin">{origin}</p>
                <div className="contract action">
                  <div className="text">
                    <ZTooltip
                      content={isCopied ? t('Copied') : t('Copy to clipboard')}
                      onShow={() => {
                        setIsCopied(false)
                        return true
                      }}
                    >
                      <span onClick={copyAddress} className="address">
                        {formatAddress(txInfo.to)}
                      </span>
                    </ZTooltip>
                    &nbsp;:&nbsp;
                    <span className="method">{tokenTxDescription.name}</span>
                  </div>
                </div>
              </section>
            ) : (
              // confirm send native
              <div className="method action-info">
                <p className="origin">{origin}</p>
                <div className="action">
                  <div className="text">
                    {t('Send')} {currentNetwork.currency}
                  </div>
                </div>
              </div>
            )}
            <section className="details">
              <h2>{t('Details')}</h2>
              <div className="transaction-detail">
                <div className="line">
                  <label>{t('Amount')}: </label>
                  <p>
                    {Number(fromWei(txInfo.value) || 0)} {currentNetwork.currency}
                  </p>
                </div>
                <div className="line">
                  <label>{t('Gas limit')}: </label>
                  <p>{Number(gasLimit || 0)}</p>
                </div>
                <div className="line">
                  <label>{t('Gas price')}: </label>
                  <p>{Number(gasPrice || 0)}</p>
                </div>
                <div className="total line">
                  <div>
                    {t('Total')}
                    <small>({t('Amount')} + gas fee)</small>
                  </div>
                  <p>
                    {calculateTransactionFee(gasPrice, gasLimit, txInfo.value)}{' '}
                    {currentNetwork.currency}
                  </p>
                </div>
              </div>
            </section>
            <div className="group-btn">
              <ZButton className="secondary" onClick={onCancel}>
                {t('Cancel')}
              </ZButton>
              <ZButton disabled={isDisable} onClick={onSubmit}>
                {t('Send')}
              </ZButton>
            </div>
          </main>
        </div>
      )}
    </>
  )
}

export default RequestSendTransaction
