import React from 'react'
import { useHistory } from 'react-router'
import { useSelector } from 'react-redux'
import { isAddress } from 'web3-utils'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'

import { ZButton } from '@components/ZButtons'
import { selectedAccountSelector } from '@selectors/common.selectors'
import { logErr } from '@shared/util/logger'
import * as actions from '@store/actions'
import './ImportNFT.scss'
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
  id: Yup.number()
    .min(0, 'Id must be less than or equal 0')
    .required('Id is required')
})

const initValues = {
  contractAddress: '',
  id: 0
}

function ImportNFT() {
  const selectedAccount = useSelector(selectedAccountSelector)
  const history = useHistory()
  const { t } = useTranslation()

  const onImportNFT = async ({ contractAddress, id }, { setErrors }) => {
    try {
      const { isContractAddress } = await actions.readAddressAsContract(contractAddress)
      if (isContractAddress) {
        const item = { address: contractAddress, id }
        await actions.addNFT({ userAddr: selectedAccount.address, nftItem: item })
        history.goBack()
      } else {
        setErrors({ contractAddress: `Contract hasn't deploy on this network!` })
      }
    } catch (error) {
      logErr({ error, data: { contractAddress, id } })
      setErrors({ id: error.message || 'Something went wrong!' })
    }
  }

  return (
    <div className="import-nft-page">
      <div className="main-content">
        <h2 className="title">{t('Import NFT')}</h2>
        <Formik
          initialValues={initValues}
          validationSchema={validationSchema}
          onSubmit={onImportNFT}
        >
          {({ errors, touched, isSubmitting }) => {
            return (
              <Form className="zForm">
                {errors.validation && <p className="alert alert-danger">{errors.validation}</p>}

                <div
                  className={`form-group ${
                    errors.contractAddress && touched.contractAddress ? 'error' : ''
                  }`}
                >
                  <label>{t('Contract Address')}</label>
                  <Field type="text" name="contractAddress" className="form-control" />
                  <p className="err-msg">
                    {errors.contractAddress && touched.contractAddress
                      ? `${t(errors.contractAddress)}`
                      : ''}
                  </p>
                </div>
                <div className={`form-group ${errors.id && touched.id ? 'error' : ''}`}>
                  <label>{t('NFT Id')}</label>
                  <Field type="number" name="id" className="form-control" />
                  <p className="err-msg">{errors.id && touched.id ? `${t(errors.id)}` : ''}</p>
                </div>
                <div className="btn-group">
                  <ZButton className="secondary" type="reset" onClick={history.goBack}>
                    {t('Cancel')}
                  </ZButton>
                  <ZButton disabled={isSubmitting} type="submit">
                    {isSubmitting ? `${t('Import')}...` : t('Import')}
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

export default ImportNFT
