import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'

import { selectedNetworkSelector, selectedAccountSelector } from '@selectors/common.selectors'
import bnbLogo from '@resources/images/bnb.svg'
import ethLogo from '@resources/images/eth.svg'
import './styles.scss'
import { UNITS } from '@shared/constant/app'
import { fromWei } from '@shared/util/converter'
import { formatBalance } from '@shared/util/string'
import * as actions from '@store/actions'
import SendForm from '../SendForm/SendForm'
import { useTranslation } from 'react-i18next'

function SendCoin() {
  const account = useSelector(selectedAccountSelector)
  const network = useSelector(selectedNetworkSelector)
  const history = useHistory()
  const { t } = useTranslation()

  const onSend = async ({ receiverAddress, amount, gasLimit, gasPrice }) => {
    const estimatedGasFee = fromWei(parseInt(gasLimit * gasPrice), UNITS.GWEI)

    if (parseFloat(account.balance) < parseFloat(estimatedGasFee) + parseFloat(amount)) {
      throw new Error(`Insufficient funds`)
    } else {
      try {
        await actions.sendTransaction({
          from: account,
          gas: gasLimit,
          gasPrice,
          to: receiverAddress,
          value: amount
        })
        history.goBack()
        return true
      } catch (error) {
        throw error
      }
    }
  }

  return (
    <div className="send-coin-page">
      {account && (
        <>
          <h2 className="title">
            {t('Send')} {network.currency}
          </h2>
          <div className="info">
            <div className="icon">
              <img src={network.currency === 'ETH' ? ethLogo : bnbLogo} alt="" />
            </div>
            <div className="value">
              <div className="currency">{network.currency}</div>
              <div className="balance">{`${t('Balance')}: ${formatBalance(
                account.balance,
                network.currency
              )}`}</div>
            </div>
          </div>
          <SendForm
            onSubmit={onSend}
            onCancel={history.goBack}
            network={network}
            account={account}
          />
        </>
      )}
    </div>
  )
}

export default SendCoin
