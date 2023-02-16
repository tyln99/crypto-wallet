import { fieldNames } from '@shared/constant/app'
import { calculateTransactionFee } from '@shared/util/calculator'
import { formatAddress } from '@shared/util/string'
import ZModal from '@ui/components/ZModal'
import ZNumberFormat from '@ui/components/ZNumberFormat'
import React from 'react'
import { useTranslation } from 'react-i18next'
const { RECEIVER_ADDRESS, AMOUNT, GAS_PRICE, GAS_LIMIT } = fieldNames

function ConfirmationModal({
  isShowConfirmation,
  network,
  onCancel,
  onSubmit,
  account,
  values,
  token
}) {
  const { t } = useTranslation()
  return (
    <ZModal
      show={isShowConfirmation}
      title={`Send ${network.currency}`}
      onCancel={onCancel}
      onSubmit={onSubmit}
      className="confirm-send-coin"
    >
      <div className="info">
        {t('From')}:<span>{formatAddress(account.address)}</span>
      </div>
      <div className="info">
        {t('To')}: <span>{formatAddress(values[RECEIVER_ADDRESS])}</span>
      </div>
      <div className="info">
        {t('Amount')}:{' '}
        <span>
          <ZNumberFormat
            value={values[AMOUNT]}
            currency={token ? token.symbol : network.currency}
          />
        </span>
      </div>
      <div className="info">
        {t('Gas limit')}:{' '}
        <span>
          <ZNumberFormat value={values[GAS_LIMIT]} />
        </span>
      </div>
      <div className="info">
        {t('Gas price')}:{' '}
        <span>
          <ZNumberFormat value={values[GAS_PRICE]} />
        </span>
      </div>
      <div className="info total">
        <div>
          {t('Total')}
          <small>({t('Amount')} + gas fee)</small>
        </div>
        <span>
          <ZNumberFormat
            value={calculateTransactionFee(
              values[GAS_PRICE],
              values[GAS_LIMIT],
              token ? 0 : values[AMOUNT] // AMOUNT here is TOKENS
            )}
            currency={network.currency}
          />
        </span>
      </div>
    </ZModal>
  )
}

export default ConfirmationModal
