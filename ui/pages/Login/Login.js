import React, { useContext } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'

import { useHistory, useLocation } from 'react-router-dom'
import { AuthContext } from '@providers/AuthProvider'
import { GET_WALLET_ROUTE } from '@shared/constant/routes'
import './Login.scss'
import logo from '@resources/images/logo_yellow.svg'
import '@resources/images/logo.png'
import '@resources/images/zwallet_sharelogo.png'
import { ZButton } from '@components/ZButtons'
import Footer from '@components/ZLayout/Footer'
import { getEnvironmentType } from '@app/scripts/lib/utils'
import { ENV_TYPE_POPUP } from '@shared/constant/app'
import useFetchAccounts from '@ui/hooks/useFetchAccounts'

const defaultValue = {
  password: ''
}

function Login() {
  const history = useHistory()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/account'
  const authContext = useContext(AuthContext)
  const { t } = useTranslation()
  const fetchAccounts = useFetchAccounts()

  const onUnlock = async ({ password }, { setErrors }) => {
    try {
      await authContext.login(password, (success) => {
        if (success) {
          fetchAccounts.fetchListAccounts()
          return history.push(from)
        } else {
          setErrors({ password: 'Something went wrong!' })
        }
      })
    } catch (error) {
      setErrors({ password: error.message || 'Something went wrong!' })
    }
  }

  const loginSchema = Yup.object().shape({
    password: Yup.string().required(t('Password is required!'))
  })

  return (
    <div className="login-page">
      <main className="login-container">
        <h2 className="title">
          {t('Welcome')}&nbsp;<span className="blur">{t('Back')}!</span>
        </h2>
        <div>
          <img className="logo" alt="" src={logo} />
        </div>
        <Formik initialValues={defaultValue} validationSchema={loginSchema} onSubmit={onUnlock}>
          {({ errors, touched, isSubmitting }) => {
            return (
              <Form className="zForm">
                <div
                  className={`form-group ${t(errors.password) && touched.password ? 'error' : ''}`}
                >
                  <label>{t('Password')}</label>
                  <Field type="password" name="password" className="form-control" />
                  <p className="err-msg">
                    {errors.password && touched.password ? `${t(errors.password)}` : ''}
                  </p>
                </div>
                <ZButton disabled={isSubmitting} className="submit-btn" type="submit">
                  {isSubmitting ? `${t('Login')}...` : t('Login')}
                </ZButton>
              </Form>
            )
          }}
        </Formik>
        <div
          className="forgot-password-btn"
          onClick={() => {
            if (getEnvironmentType() === ENV_TYPE_POPUP) {
              global.platform.openExtensionInBrowser(GET_WALLET_ROUTE)
            } else {
              history.push(GET_WALLET_ROUTE)
            }
          }}
        >
          {t('Forgot password?')}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Login
