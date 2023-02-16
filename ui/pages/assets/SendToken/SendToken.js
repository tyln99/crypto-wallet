import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'

import {
  selectedNetworkSelector,
  selectedAccountSelector,
  selectedTokenSelector
} from '@selectors/common.selectors'
import Loader from '@components/Loader'
import './styles.scss'
import { formatBalance } from '@shared/util/string'
import useToast from '@hooks/useToast'
import * as actions from '@store/actions'
import { fromWei } from '@shared/util/converter'
import { UNITS } from '@shared/constant/app'
import logo from '@resources/images/logo.svg'
import SendForm from '../SendForm/SendForm'
import { ACCOUNT_ROUTE } from '@shared/constant/routes'
import { useTranslation } from 'react-i18next'

function SendToken() {
  const account = useSelector(selectedAccountSelector)
  const network = useSelector(selectedNetworkSelector)
  const token = useSelector(selectedTokenSelector)
  const history = useHistory()
  const toast = useToast()
  const { t } = useTranslation()

  const [tokenDetails, setTokenDetails] = useState()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (account && token && network) {
      queryToken()
    }
  }, [account, token, network])

  const queryToken = async () => {
    try {
      setIsLoading(true)
      const details = await actions.getTokenStandardAndDetails({
        tokenAddress: token.address,
        userAddress: account.address
      })
      setTokenDetails(details)
      setIsLoading(false)
    } catch (error) {
      toast.error(error.message)
      history.replace(ACCOUNT_ROUTE)
    }
  }

  const onSend = async ({ receiverAddress, amount, gasLimit, gasPrice, data }) => {
    const estimatedGasFee = fromWei(parseInt(gasLimit * gasPrice), UNITS.GWEI)
    if (parseFloat(account.balance) < parseFloat(estimatedGasFee)) {
      throw new Error(`Insufficient ${network.currency} funds!`)
    }
    if (parseFloat(tokenDetails.balance) < parseFloat(amount)) {
      throw new Error(`Insufficient ${tokenDetails.symbol} funds.`)
    }
    try {
      await actions.sendTransaction({
        from: account,
        to: tokenDetails.address,
        gas: gasLimit,
        gasPrice,
        data: data,
        txDetails: {
          type: 'token',
          method: 'send',
          from: account.address,
          to: receiverAddress,
          amount: amount,
          currency: tokenDetails.symbol
        }
      })
      history.goBack()
      return true
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="send-token-page">
      <Loader isActive={isLoading} />
      {tokenDetails && account && (
        <>
          <h2 className="form-header title">
            {t('Send')} {tokenDetails.symbol}
          </h2>
          <div className="info">
            <div className="icon">
              <img src={logo} alt="" />
            </div>
            <div className="value">
              <div className="currency">{tokenDetails.symbol}</div>
              <div className="balance">{`Balance: ${formatBalance(
                tokenDetails.balance,
                tokenDetails.symbol
              )}`}</div>
            </div>
          </div>
          <SendForm
            onSubmit={onSend}
            onCancel={history.goBack}
            network={network}
            account={account}
            token={tokenDetails}
          />
        </>
      )}
    </div>
  )
}

export default SendToken
