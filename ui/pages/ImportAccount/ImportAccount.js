import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { ZButton } from '@components/ZButtons'
import { listAccountsSelector } from '@selectors/common.selectors'
import { setListAccounts, setSelectedAccount } from '@actions/creator'
import './ImportAccount.scss'
import * as actions from '@store/actions'
import { Field, Formik, Form } from 'formik'
import * as Yup from 'yup'
import importIcon from '@resources/images/import-wallet.svg'
import { logErr } from '@shared/util/logger'
import { useTranslation } from 'react-i18next'

const PRIVATE_KEY_FIELD = 'privateKey'
const NAME_FIELD = 'accountName'

const initValues = {
  [PRIVATE_KEY_FIELD]: '',
  [NAME_FIELD]: ''
}

function ImportAccount() {
  const history = useHistory()
  const listAccounts = useSelector(listAccountsSelector)
  const dispatch = useDispatch()
  const [contacts, setContacts] = useState({})
  const { t } = useTranslation()

  useEffect(() => {
    fetchNames()
  }, [])

  const fetchNames = async () => {
    try {
      setContacts(await actions.getContacts())
    } catch (error) {}
  }

  const checkExistsName = (name) => {
    for (const address in contacts) {
      if (contacts[address]?.name === name?.trim()) {
        return true
      }
    }
    return false
  }

  Yup.addMethod(Yup.string, 'nameExistsValidate', function(err) {
    return this.test('test-name-validity', err, function(value) {
      const { path, createError } = this
      if (checkExistsName(value)) {
        return createError({ path, message: err })
      }
      return true
    })
  })

  const validationSchema = Yup.object().shape({
    [PRIVATE_KEY_FIELD]: Yup.string().required('PrivateKey is required'),
    [NAME_FIELD]: Yup.string()
      .required('Account name is required')
      .nameExistsValidate(`Account name is already exists`)
  })

  const onImportAccount = async ({ privateKey, accountName }, { setErrors }) => {
    // if (checkExistsName(accountName)) {
    //   return setErrors({ [NAME_FIELD]: `Account name is already exists` })
    // }

    try {
      const newAccount = await actions.importAccount(privateKey)
      const balance = await actions.getBalance(newAccount.address)
      newAccount.balance = balance
      newAccount.contactInfo = { name: accountName }
      listAccounts.push(newAccount)
      dispatch(setSelectedAccount(newAccount))
      dispatch(setListAccounts(listAccounts))
      actions.updateZWalletState({ selectedAddress: newAccount.address })
      await actions.addContact({ name: accountName.trim(), address: newAccount.address })
      history.goBack()
    } catch (error) {
      logErr({ error })
      setErrors({ [PRIVATE_KEY_FIELD]: error.message || 'Something went wrong!' })
    }
  }

  return (
    <div className="import-account-page">
      <div className="icon">
        <img alt="" src={importIcon} />
      </div>
      <h2 className="title">{t('Import account')}</h2>
      <p className="description">
        {t(
          'Imported accounts will not be associated with your originally created ZWallet account Secret Recovery Phrase.'
        )}
      </p>

      <Formik
        initialValues={initValues}
        validationSchema={validationSchema}
        onSubmit={onImportAccount}
      >
        {({ errors, touched, isSubmitting }) => {
          return (
            <Form className="zForm">
              <div
                className={`form-group ${errors[NAME_FIELD] && touched[NAME_FIELD] ? 'error' : ''}`}
              >
                <label>{t('Account name')}</label>
                <Field name={NAME_FIELD} className="form-control" />
                <p className="err-msg">
                  {errors[NAME_FIELD] && touched[NAME_FIELD] ? `${t(errors[NAME_FIELD])}` : ''}
                </p>
              </div>
              <div
                className={`form-group ${
                  errors[PRIVATE_KEY_FIELD] && touched[PRIVATE_KEY_FIELD] ? 'error' : ''
                }`}
              >
                <label>{t('Private key')}</label>
                <Field type="text" name="privateKey" className="form-control" />
                <p className="err-msg">
                  {errors[PRIVATE_KEY_FIELD] && touched[PRIVATE_KEY_FIELD]
                    ? `${t(errors[PRIVATE_KEY_FIELD])}`
                    : ''}
                </p>
              </div>
              <div className="btn-group">
                <ZButton className="secondary" type="reset" onClick={history.goBack}>
                  {t('Cancel')}
                </ZButton>
                <ZButton disabled={isSubmitting} type="submit">
                  {t('Import')}
                </ZButton>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

export default ImportAccount
