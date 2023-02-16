import React from 'react'
import { useHistory } from 'react-router'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

import { ZButton } from '@components/ZButtons'
import { useTranslation } from 'react-i18next'

const defaultValue = {
  password: '',
  confirmPassword: ''
}

const walletSchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is required')
    .test(8, 'Password must at least 8 characters', (val) => val?.length >= 8),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match')
})

function CreatePasswordForm({ onSubmit }) {
  const history = useHistory()
  const { t } = useTranslation()

  const handleSubmit = async ({ password }) => {
    onSubmit && onSubmit(password)
  }

  return (
    <Formik initialValues={defaultValue} validationSchema={walletSchema} onSubmit={handleSubmit}>
      {({ errors, touched, isValid }) => {
        return (
          <Form className="zForm">
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
                {t('Create')}
              </ZButton>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}

export default CreatePasswordForm
