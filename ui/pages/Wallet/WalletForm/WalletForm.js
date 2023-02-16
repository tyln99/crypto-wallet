import React from 'react'
import { useHistory } from 'react-router'
import { generateMnemonic, validateMnemonic } from 'bip39'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

import { ZButton } from '@components/ZButtons'
import { LOGIN_ROUTE } from '@shared/constant/routes'
import * as actions from '@store/actions'
import useToast from '@hooks/useToast'
import { logErr } from '@shared/util/logger'
import { useTranslation } from 'react-i18next'
import RecoveryPhraseChips from '@components/RecoveryPhraseChips'
import './WalletForm.scss'
import { Alert } from 'react-bootstrap'

const defaultValue = {
  seed: '',
  password: '',
  confirmPassword: ''
}

Yup.addMethod(Yup.string, 'seedPhraseValidate', function(err) {
  return this.test('test-seed-validity', err, function(value) {
    const { path, createError } = this
    return validateMnemonic(value) || createError({ path, message: err })
  })
})

const walletSchema = Yup.object().shape({
  seed: Yup.string()
    .required('Seed is required')
    .seedPhraseValidate('Seed is not valid'),
  password: Yup.string()
    .required('Password is required')
    .test(8, 'Password must at least 8 characters', (val) => val?.length >= 8),
  confirmPassword: Yup.string()
    .required('New Password is required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
})

const formActions = {
  IMPORT: 'Import',
  CREATE: 'Create'
}

function WalletForm({ formAction = 'Import' }) {
  const history = useHistory()
  const toast = useToast()
  const { t } = useTranslation()

  const onSubmit = async (values) => {
    const { seed, password } = values

    try {
      switch (formAction) {
        case formActions.CREATE:
          actions.clearImportedAccounts()
          await actions.createNewWallet(seed, password)
          break

        case formActions.IMPORT:
          actions.clearImportedAccounts()
          await actions.restoreWallet(seed, password)
          break

        default:
          break
      }
      history.push(LOGIN_ROUTE)
    } catch (error) {
      logErr({ error, data: { values } })
      return toast.error(error.message || 'Something went wrong!')
    }
  }

  const isCreate = formAction === formActions.CREATE

  return (
    <Formik
      initialValues={{
        ...defaultValue,
        seed: isCreate ? generateMnemonic() : ''
      }}
      validationSchema={walletSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, setFieldValue, setTouched, isValid }) => {
        return (
          <Form className="zForm wallet-form">
            <div
              className={`form-group seed-phrases-input`}
              onBlur={() => setTouched({ seed: true })}
            >
              <RecoveryPhraseChips onChange={(seed) => setFieldValue('seed', seed)} />
              {errors.seed && touched.seed ? <Alert variant="danger">{t(errors.seed)}</Alert> : ''}
            </div>
            <div className={`form-group ${errors.password && touched.password ? 'error' : ''}`}>
              <label>{t('New Password')}</label>
              <Field type="password" name="password" className="form-control" />
              <p className="err-msg">
                {errors.password && touched.password ? t(errors.password) : ''}
              </p>
            </div>
            <div
              className={`form-group ${
                errors.confirmPassword && touched.confirmPassword ? 'error' : ''
              }`}
            >
              <label>{t('Confirm Password')}</label>
              <Field type="password" name="confirmPassword" className="form-control" />
              <p className="err-msg">
                {errors.confirmPassword && touched.confirmPassword ? t(errors.confirmPassword) : ''}
              </p>
            </div>
            <div className="btn-group">
              <ZButton type="reset" onClick={history.goBack} className="secondary">
                {t('Cancel')}
              </ZButton>
              <ZButton disabled={!isValid} type="submit">
                {isCreate ? t('Create') : t('Restore')}
              </ZButton>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}

export default WalletForm
