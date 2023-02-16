import React from 'react'

import { ActivityCardStyled } from './styled'
import { stringCapitalize, formatAddress } from '@shared/util/string'
import { miliToDate } from '@shared/util/common'
import { fromWei } from '@shared/util/converter'
import ZNumberFormat from '@components/ZNumberFormat'
import { useTranslation } from 'react-i18next'

const ActivityCard = ({ activity, networkCurrency, onClick }) => {
  const { t } = useTranslation()

  const getDisplayMethod = () => {
    const { txDetails } = activity
    if (txDetails && txDetails.type === 'token') {
      const { method, currency = '' } = txDetails
      return stringCapitalize(method) + ' ' + currency
    } else {
      return t('Send')
    }
  }

  const getAmountAndCurrency = () => {
    let { value, txDetails } = activity
    value = fromWei(parseInt(value, 16))
    if (value > 0) {
      return { amount: value, currency: networkCurrency }
    } else if (txDetails && txDetails.type === 'token') {
      const { amount, currency } = txDetails
      return { amount, currency }
    } else {
      return { amount: 0, currency: networkCurrency }
    }
  }

  const getDisplayReceiver = () => {
    const { to, txDetails } = activity
    if (txDetails && txDetails.type === 'token') {
      return txDetails.to
    } else return to
  }

  return (
    <ActivityCardStyled ID="activity-card" onClick={onClick}>
      <div className="left-container">
        <div>{getDisplayMethod()}</div>
        <div className={`status status--${activity.status}`}>
          {t(stringCapitalize(activity.status || ''))}
        </div>
        <div className="date-to-info">
          {miliToDate(activity.time)} . to {formatAddress(getDisplayReceiver())}
        </div>
      </div>
      <div className="amount">
        <ZNumberFormat
          value={getAmountAndCurrency().amount}
          currency={getAmountAndCurrency().currency}
        />
      </div>
    </ActivityCardStyled>
  )
}

export default ActivityCard
