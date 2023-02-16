import { useFormik } from 'formik'
import { isAddress } from 'web3-utils'
import * as Yup from 'yup'
import React, { useEffect, useState } from 'react'
import ZInputNumber from '@ui/components/ZInputNumber'
import { ZButton } from '@ui/components/ZButtons'
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal'
import { log, logErr } from '@shared/util/logger'
import * as actions from '@store/actions'
import { generateERC20TransferData } from '@shared/util/send.utils'
import { CONTACT_TYPE, fieldNames, MINIMUM_GAS_LIMIT } from '@shared/constant/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressCard } from '@fortawesome/free-solid-svg-icons'
import ZModal from '@ui/components/ZModal'
import './SendForm.scss'
import { useSelector } from 'react-redux'
import { listAccountsSelector } from '@selectors/common.selectors'
import { formatAddress } from '@shared/util/string'
import ZTooltip from '@ui/components/ZTooltip'
import useInterval from '@ui/hooks/useInterval'
import { SECOND } from '@shared/constant/time'
import { useTranslation } from 'react-i18next'

const { RECEIVER_ADDRESS, AMOUNT, GAS_PRICE, GAS_LIMIT, DATA } = fieldNames

const initValues = {
  [RECEIVER_ADDRESS]: '',
  [AMOUNT]: 0,
  [GAS_PRICE]: 10,
  [GAS_LIMIT]: MINIMUM_GAS_LIMIT,
  [DATA]: ''
}

Yup.addMethod(Yup.string, 'addressValidate', function(err) {
  return this.test('test-address-validity', err, function(value) {
    const { path, createError } = this
    return isAddress(value) || createError({ path, message: err })
  })
})

const sendSchema = Yup.object().shape({
  [RECEIVER_ADDRESS]: Yup.string()
    .required('Receiver Address is required')
    .addressValidate('Receiver Address is not valid'),
  [AMOUNT]: Yup.number()
    .required('Amount is required')
    .min(0, 'Amount must be greater than or equal to 0'),
  [GAS_PRICE]: Yup.number()
    .required('GasPrice is required')
    .min(0, 'GasPrice must be greater than or equal to 0'),
  [GAS_LIMIT]: Yup.number()
    .required('GasLimit is required')
    .min(MINIMUM_GAS_LIMIT, 'GasLimit must be greater than or equal to 21000')
})

function SendForm({ onSubmit, onCancel, network, account, token = null }) {
  const listAccounts = useSelector(listAccountsSelector)
  const [isShowConfirmation, setIsShowConfirmation] = useState(false)
  const [isShowAddressPicker, setIsShowAddressPicker] = useState(false)
  const [contacts, setContacts] = useState()
  const { t } = useTranslation()

  useEffect(() => {
    fetchGasPrice()
  }, [network])

  const fetchGasPrice = async () => {
    if (account.balance) {
      // console.log('fetchGasPrice interval')
      try {
        const gasPrice = await actions.getGasPrice()
        formik.setFieldValue(GAS_PRICE, gasPrice)
      } catch (error) {}
    }
  }

  useInterval(fetchGasPrice, SECOND * 30, 3)

  const closeAddressPickerModal = () => setIsShowAddressPicker(false)
  const onSelectAddress = (address) => {
    formik.setFieldValue([RECEIVER_ADDRESS], address)
    closeAddressPickerModal()
  }

  useEffect(() => {
    fetchNames()
  }, [])

  const fetchNames = async () => {
    try {
      setContacts(await actions.searchContacts({ type: CONTACT_TYPE.EXTERNAL }))
    } catch (error) {}
  }

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: sendSchema,
    onSubmit: async (values) => {
      setIsShowConfirmation(false)
      try {
        await onSubmit(values)
      } catch (error) {
        logErr({ error })
        formik.setErrors({ validation: error.message || 'Something went wrong!' })
      } finally {
        formik.setSubmitting(false)
      }
    }
  })

  useEffect(() => {
    log('on estimate gas')
    // if Token not NULL => Form is send Token
    const receive = formik.values[RECEIVER_ADDRESS]
    const amount = formik.values[AMOUNT]
    if (token && isAddress(receive) && isAddress(token.address)) {
      try {
        const data = generateERC20TransferData(receive, amount)
        formik.setFieldValue(DATA, data)
        onEstimateGas(token.address, data)
      } catch (error) {
        logErr({ error })
      }
    }
  }, [formik.values[AMOUNT], formik.values[RECEIVER_ADDRESS], token])

  const onEstimateGas = async (to, data) => {
    try {
      const gas = await actions.estimateGas({ from: account.address, to, data })
      log('Estimated gas: ', gas)
      formik.setFieldValue(GAS_LIMIT, gas)
    } catch (error) {
      logErr({ error })
    }
  }

  const checkError = (fieldName) => {
    return formik.errors[fieldName] && formik.touched[fieldName]
  }

  return (
    <>
      <form className="zForm send-form" onSubmit={(e) => e.preventDefault()}>
        {formik.errors.validation && (
          <p className="alert alert-danger">{t(formik.errors.validation)}</p>
        )}

        <div className={`address-block form-group ${checkError(RECEIVER_ADDRESS) && 'error'}`}>
          <label>{t('Receiver address')}</label>
          <ZTooltip
            onShow={() => (formik.values[RECEIVER_ADDRESS] ? true : false)}
            content={formik.values[RECEIVER_ADDRESS]}
          >
            <input
              name={RECEIVER_ADDRESS}
              className="form-control"
              value={formik.values[RECEIVER_ADDRESS]}
              onChange={(e) => formik.setFieldValue([RECEIVER_ADDRESS], e.target.value)}
              onBlur={formik.handleBlur}
            />
          </ZTooltip>
          <p className="err-msg">
            {checkError(RECEIVER_ADDRESS) && t(formik.errors[RECEIVER_ADDRESS])}
          </p>
          <FontAwesomeIcon
            className="address-picker-btn"
            icon={faAddressCard}
            onClick={() => setIsShowAddressPicker(true)}
          />
        </div>
        <div className={`form-group ${checkError(AMOUNT) && 'error'}`}>
          <label>
            {t('Amount')} ({token ? token.symbol : network.currency})
          </label>
          <ZInputNumber
            name={AMOUNT}
            initValue={formik.values[AMOUNT]}
            onChange={(value) => formik.setFieldValue(AMOUNT, value)}
            onBlur={formik.handleBlur}
          />
          <p className="err-msg">{checkError(AMOUNT) && t(formik.errors[AMOUNT])}</p>
        </div>
        <div className="row">
          <div className={`column form-group ${checkError(GAS_PRICE) && 'error'}`}>
            <label>{t('Gas price')} (Gwei)</label>
            <ZInputNumber
              name={GAS_PRICE}
              initValue={formik.values[GAS_PRICE]}
              onChange={(value) => formik.setFieldValue(GAS_PRICE, value)}
              onBlur={formik.handleBlur}
            />
            <p className="err-msg">{checkError(GAS_PRICE) && t(formik.errors[GAS_PRICE])}</p>
          </div>
          <div className={`column form-group ${checkError(GAS_LIMIT) && 'error'}`}>
            <label>{t('Gas limit')}</label>
            <ZInputNumber
              name={GAS_LIMIT}
              initValue={formik.values[GAS_LIMIT]}
              onChange={(value) => formik.setFieldValue(GAS_LIMIT, value)}
              onBlur={formik.handleBlur}
            />
            <p className="err-msg">{checkError(GAS_LIMIT) && t(formik.errors[GAS_LIMIT])}</p>
          </div>
        </div>
        <div className="btn-group">
          <ZButton onClick={onCancel} className="secondary">
            {t('Cancel')}
          </ZButton>
          <ZButton
            disabled={!formik.isValid || formik.isSubmitting}
            onClick={() => setIsShowConfirmation(true)}
          >
            {formik.isSubmitting ? `${t('Send')}ing...` : t('Send')}
          </ZButton>
        </div>

        {isShowConfirmation && (
          <ConfirmationModal
            isShowConfirmation={isShowConfirmation}
            network={network}
            onCancel={() => setIsShowConfirmation(false)}
            onSubmit={formik.submitForm}
            account={account}
            values={formik.values}
            token={token}
          />
        )}
      </form>

      <ZModal
        show={isShowAddressPicker}
        onCancel={closeAddressPickerModal}
        isShowControlButtons={false}
        title={t('Select receiver address')}
        className="address-picker-modal"
      >
        <div>
          <div className="my-accounts">
            <h2>{t('My Accounts')}</h2>
            <div className="content scrollbar__enabled">
              {listAccounts &&
                listAccounts.map((item, index) => {
                  return (
                    <p
                      key={index}
                      className="address-item"
                      onClick={() => onSelectAddress(item.address)}
                    >
                      {formatAddress(item?.contactInfo?.name || item.address)}
                    </p>
                  )
                })}
            </div>
          </div>

          <div className="my-contact">
            <h2>{t('My Contacts')}</h2>

            <div className="content scrollbar__enabled">
              {contacts &&
                Object.keys(contacts).map((address, index) => {
                  return (
                    <p
                      key={index}
                      className="address-item"
                      onClick={() => onSelectAddress(address)}
                    >
                      {formatAddress(contacts[address].name || address)}
                    </p>
                  )
                })}
            </div>
          </div>
        </div>
      </ZModal>
    </>
  )
}

export default SendForm
