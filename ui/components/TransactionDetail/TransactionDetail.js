import React, { useEffect, useState } from 'react'
import './TransactionDetail.scss'
import { UNITS, TRANSACTION_STATUSES } from '@shared/constant/app'
import ZTooltip from '@components/ZTooltip'
import { formatAddress, stringCapitalize } from '@shared/util/string'
import { fromWei } from '@shared/util/converter'
import { calculateTransactionFee } from '@shared/util/calculator'
import ZNumberFormat from '@components/ZNumberFormat'
import { log } from '@shared/util/logger'
import arrowRight from '@resources/images/arrow_right.svg'
import { useTranslation } from 'react-i18next'

function TransactionDetail({ data: txData, networkCurrency }) {
  const [total, setTotal] = useState(0)
  const [amount, setAmount] = useState(0)
  const [gasPrice, setGasPrice] = useState(0)
  const [gasLimit, setGasLimit] = useState(0)
  const [gasUsed, setGasUsed] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    let { value, gasPrice, gasUsed, gasLimit, txReceipt } = txData
    gasPrice = fromWei(parseInt(gasPrice, 16), UNITS.GWEI)
    gasLimit = parseInt(gasLimit, 16)
    value = fromWei(parseInt(value, 16))
    setAmount(value)
    setGasPrice(gasPrice)
    setGasLimit(gasLimit)
    if (txReceipt) {
      gasUsed = parseInt(txReceipt.gasUsed, 16)
      setGasUsed(gasUsed)
    }
    log(gasPrice, gasUsed, gasLimit, value)
    setTotal(calculateTransactionFee(gasPrice, gasUsed, value))
  }, [])

  const onCopyTransID = () => {
    if (
      txData.status === TRANSACTION_STATUSES.APPROVED ||
      txData.status === TRANSACTION_STATUSES.CONFIRMED ||
      txData.status === TRANSACTION_STATUSES.PENDING
    ) {
      navigator.clipboard.writeText(txData.hash)
      setIsCopied(true)
    }
  }

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address)
    setIsCopied(true)
  }

  const getDisplayReceiver = () => {
    const { txDetails, to } = txData
    if (txDetails && txDetails.type === 'token') {
      return txDetails.to
    } else return to
  }

  return (
    <div className="transaction-detail-container">
      <div className="line">
        <span>{t('Status')}:</span>
        <span className={`status status--${txData.status}`}>
          {t(stringCapitalize(txData.status))}
        </span>
      </div>
      <div className="line copy-trans">
        <div></div>
        <ZTooltip
          disabled={txData.status === TRANSACTION_STATUSES.FAILED}
          content={isCopied ? t('Copied') : t('Copy to clipboard')}
          onShow={() => {
            setIsCopied(false)
            return true
          }}
          placement="left"
        >
          <span
            className={txData.status === TRANSACTION_STATUSES.FAILED ? 'disabled' : ''}
            onClick={onCopyTransID}
          >
            {t('Copy Transaction ID')}
          </span>
        </ZTooltip>
      </div>
      <div className="line from-to">
        <span>{t('From')}</span>
        <span>{t('To')}</span>
      </div>
      <div className="line direction">
        <ZTooltip
          content={isCopied ? t('Copied') : t('Copy to clipboard')}
          onShow={() => {
            setIsCopied(false)
            return true
          }}
          placement="bottom"
        >
          <strong onClick={() => copyAddress(txData.from)}>{formatAddress(txData.from)}</strong>
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
          <strong onClick={() => copyAddress(getDisplayReceiver())}>
            {formatAddress(getDisplayReceiver())}
          </strong>
        </ZTooltip>
      </div>
      <div className="transaction-detail">
        <h4 className="transaction-detail-title">{t('Transaction')}</h4>
        <div className="line nonce">
          <span>{t('Nonce')}</span>
          <span>{parseInt(txData.nonce, 16)}</span>
        </div>
        <div className="line amount">
          <span>{t('Amount')}</span>
          <strong>
            <ZNumberFormat value={amount} currency={networkCurrency} />
          </strong>
        </div>
        {txData.txDetails && txData.txDetails.type === 'token' && (
          <div className="line amount">
            <span>{t('Token')}</span>
            <strong>
              <ZNumberFormat value={txData.txDetails.amount} currency={txData.txDetails.currency} />
            </strong>
          </div>
        )}
        <div className="line gas-limit">
          <span>{t('Gas limit')}</span>
          <ZNumberFormat value={gasLimit} />
        </div>
        <div className="line gas-used">
          <span>{t('Gas used')}</span>
          <ZNumberFormat value={gasUsed} />
        </div>
        <div className="line gas-price">
          <span>{t('Gas price')} (Gwei)</span>
          <ZNumberFormat value={gasPrice} />
        </div>
        <div className="line total">
          <div>
            {t('Total')}
            <small>({t('Amount')} + gas fee)</small>
          </div>
          <strong>
            {total} {networkCurrency}
          </strong>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetail
