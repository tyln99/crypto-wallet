import React from 'react'
import { isAddress } from 'web3-utils'
import { useHistory } from 'react-router'
import { useSelector } from 'react-redux'
import { Field, Formik, Form } from 'formik'
import * as Yup from 'yup'

import { ZButton } from '@components/ZButtons'
import { selectedAccountSelector } from '@selectors/common.selectors'
import { log, logErr } from '@shared/util/logger'
import * as actions from '@store/actions'
import './ImportToken.scss'
import useToast from '@ui/hooks/useToast'
import { useTranslation } from 'react-i18next'

Yup.addMethod(Yup.string, 'addressValidate', function(err) {
  return this.test('test-address-validity', err, function(value) {
    const { path, createError } = this
    return isAddress(value) || createError({ path, message: err })
  })
})

const validationSchema = Yup.object().shape({
  contractAddress: Yup.string()
    .required('Contract Address is required')
    .addressValidate('Contract Address is not valid'),
  symbol: Yup.string().required('Symbol is required'),
  decimals: Yup.number()
    .min(0)
    .required('Decimals is required')
})

const initValues = {
  contractAddress: '',
  symbol: ''
}

function ImportToken() {
  const selectedAccount = useSelector(selectedAccountSelector)
  const history = useHistory()
  const toast = useToast()
  const { t } = useTranslation()

  const fetchTokenInfo = (address, setFieldValue) => {
    const delayDebounceFn = setTimeout(async () => {
      if (isAddress(address)) {
        try {
          const { isContractAddress } = await actions.readAddressAsContract(address)
          if (isContractAddress) {
            const details = await actions.getTokenStandardAndDetails({
              tokenAddress: address,
              userAddress: selectedAccount.address
            })
            log('details: ', details)
            if (details?.decimals) {
              setFieldValue('decimals', details?.decimals)
            }
            if (details?.symbol) {
              setFieldValue('symbol', details?.symbol)
            }
          } else {
            toast.error("Contract hasn't deploy on this network!")
          }
        } catch (error) {
          logErr({ error, data: { address, setFieldValue } })
          toast.error(error.message || 'Something went wrong!')
        }
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }

  const onImportToken = async ({ contractAddress: address, decimals, symbol }, { setErrors }) => {
    try {
      await actions.addToken({
        userAddress: selectedAccount.address,
        tokenDetail: { address, decimals, symbol }
      })
      history.goBack()
    } catch (error) {
      logErr({ error, data: { address, decimals, symbol } })
      setErrors({ validation: error.message || 'Something went wrong!' })
    }
  }

  return (
    <div className="import-token-page">
      <div className="main-content">
        <h2 className="title">{t('Import account')}</h2>
        <Formik
          initialValues={initValues}
          validationSchema={validationSchema}
          onSubmit={onImportToken}
        >
          {({ errors, touched, isSubmitting, setFieldValue }) => {
            return (
              <Form className="zForm">
                {errors.validation && <p className="alert alert-danger">{errors.validation}</p>}

                <div
                  className={`form-group ${
                    errors.contractAddress && touched.contractAddress ? 'error' : ''
                  }`}
                >
                  <label>{t('Contract Address')}</label>
                  <Field
                    onChange={(e) => {
                      const addr = e.target.value
                      setFieldValue('contractAddress', addr)
                      fetchTokenInfo(addr, setFieldValue)
                    }}
                    type="text"
                    name="contractAddress"
                    className="form-control"
                  />
                  <p className="err-msg">
                    {errors.contractAddress && touched.contractAddress
                      ? `${t(errors.contractAddress)}`
                      : ''}
                  </p>
                </div>
                <div className={`form-group ${errors.symbol && touched.symbol ? 'error' : ''}`}>
                  <label>{t('Symbol')}</label>
                  <Field disabled={true} type="text" name="symbol" className="form-control" />
                  <p className="err-msg">
                    {errors.symbol && touched.symbol ? `${t(errors.symbol)}` : ''}
                  </p>
                </div>
                <div className={`form-group ${errors.decimals && touched.decimals ? 'error' : ''}`}>
                  <label>{t('Decimals')}</label>
                  <Field disabled={true} type="number" name="decimals" className="form-control" />
                  <p className="err-msg">
                    {errors.decimals && touched.decimals ? `${t(errors.decimals)}` : ''}
                  </p>
                </div>
                <div className="btn-group">
                  <ZButton className="secondary" type="reset" onClick={history.goBack}>
                    {t('Cancel')}
                  </ZButton>
                  <ZButton disabled={isSubmitting} type="submit">
                    {isSubmitting ? `${t('Import')}ing...` : t('Import')}
                  </ZButton>
                </div>
              </Form>
            )
          }}
        </Formik>
      </div>
    </div>
  )
}

export default ImportToken
