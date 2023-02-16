import { ZButton } from '@ui/components/ZButtons'
import { getMnemonic, unlock } from '@store/actions'
import { Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './RevealSeedForm.scss'
import { useHistory } from 'react-router'
import { ACCOUNT_ROUTE } from '@shared/constant/routes'
import ZTooltip from '@ui/components/ZTooltip'
import copyIcon from '@resources/images/copy.svg'
import download from '@resources/images/download_grey.svg'
import { download_csv_file } from '@shared/util/export.util'

const defaultValue = {
  password: ''
}

function RevealSeedForm({ onCancel }) {
  const { t } = useTranslation()
  const history = useHistory()
  const [hide, setHide] = useState(true)
  const [seed, setSeed] = useState()

  const handleSubmit = async ({ password }, { setErrors }) => {
    try {
      try {
        const success = await unlock(password)
        if (success) {
          console.log('mnemonic', await getMnemonic())
          setSeed(await getMnemonic())
        } else {
          throw new Error('Something went wrong!')
        }
      } catch (error) {
        throw error
      }
    } catch (error) {
      setErrors({ password: error.message || 'Something went wrong!' })
    }
  }

  const loginSchema = Yup.object().shape({
    password: Yup.string().required(t('Password is required!'))
  })

  const handleHideSeed = () => {
    setHide(false)
  }

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seed)
  }

  const handleExport = () => {
    download_csv_file('seed.csv', [[seed]])
  }

  return (
    <div className="reveal-seed-form">
      {seed ? (
        <>
          <div onClick={handleHideSeed} className={`seed-area ${hide ? 'blur' : ''}`}>
            <div className={`seed ${hide ? 'blur' : ''}`}> {seed}</div>
            {hide && <FontAwesomeIcon icon={faLock} />}
          </div>
          <div className="group-btn">
            <ZButton className="secondary" onClick={handleCopySeed}>
              <img alt="" src={copyIcon} />
              {t('Copy')}
            </ZButton>
            &nbsp;
            <ZButton className="secondary" onClick={handleExport}>
              <img alt="" src={download} />
              {t('Export')}
            </ZButton>
          </div>
        </>
      ) : (
        <Formik initialValues={defaultValue} validationSchema={loginSchema} onSubmit={handleSubmit}>
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
                <div className="group-btn">
                  <ZButton
                    className="secondary"
                    onClick={() => {
                      onCancel && onCancel()
                    }}
                  >
                    {t('Cancel')}
                  </ZButton>
                  &nbsp;
                  <ZButton disabled={isSubmitting} className="submit-btn" type="submit">
                    {t('Next')}
                  </ZButton>
                </div>
              </Form>
            )
          }}
        </Formik>
      )}
    </div>
  )
}

export default RevealSeedForm
