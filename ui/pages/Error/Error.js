import React from 'react'
import logo from '@resources/images/logo_yellow.svg'
import { useTranslation } from 'react-i18next'
import './Error.scss'
import Footer from '@components/ZLayout/Footer'

function Error() {
  const { t } = useTranslation()

  return (
    <div className="error-page">
      <img alt="" src={logo} />
      <p className="message">{t('Something went wrong!')}</p>
      <p className="description">{t('Please try again later')}.</p>
      <Footer />
    </div>
  )
}

export default Error
