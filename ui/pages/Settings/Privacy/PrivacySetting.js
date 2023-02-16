import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ZButton } from '@ui/components/ZButtons'
import './PrivacySetting.scss'
import { Alert } from 'react-bootstrap'
import RevealSeedForm from './RevealSeedForm'

function PrivacySetting() {
  const { t } = useTranslation()
  const [showPasswordForm, setShowPasswordForm] = useState()

  const handleOpenRevealSeedModal = () => setShowPasswordForm(true)
  const handleCloseRevealSeedModal = () => setShowPasswordForm(false)

  return (
    <div className="privacy-setting-content">
      <div className="privacy-setting-header">
        <h2>{t('Security & Privacy')}</h2>
      </div>
      <main>
        <Alert variant="danger" className="alert">
          {t(
            `DO NOT share this phrase with anyone! These words can be used to steal all your accounts.`
          )}
        </Alert>
        {showPasswordForm ? (
          <RevealSeedForm onCancel={handleCloseRevealSeedModal} />
        ) : (
          <ZButton className="reveal-btn secondary" onClick={handleOpenRevealSeedModal}>
            {t('Reveal Secret Recovery Phrase')}
          </ZButton>
        )}
      </main>
    </div>
  )
}

export default PrivacySetting
