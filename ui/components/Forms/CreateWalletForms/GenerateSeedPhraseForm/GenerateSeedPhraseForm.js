import { faLock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ZButton } from '@ui/components/ZButtons'
import { generateMnemonic } from 'bip39'
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import './GenerateSeedPhraseForm.scss'

function GenerateSeedPhraseForm({ onSubmit, onCancel }) {
  const [mnemonic, setMnemonic] = useState()
  const [hide, setHide] = useState(true)

  const { t } = useTranslation()

  useEffect(() => {
    setMnemonic(generateMnemonic())
  }, [])

  const handleHideSeed = () => {
    setHide(false)
  }

  const handleOnSubmit = () => {
    onSubmit && onSubmit(mnemonic)
  }

  return (
    <div className="generate-seed-form">
      <Alert variant="warning" className="description">
        {t(
          `ZWallet does not keep your Secret Recovery Phrase. If you're having trouble unlocking your account, you will need to reset your wallet. You can do this by providing the Secret Recovery Phrase you used when you set up your wallet.`
        )}
        <br />
        <br />
        {t(
          `Make sure you're using the correct Secret Recovery Phrase before proceeding. You will not be able to undo this.`
        )}
      </Alert>
      <div onClick={handleHideSeed} className={`seed-area ${hide ? 'blur' : ''}`}>
        <div className={`seed ${hide ? 'blur' : ''}`}> {mnemonic}</div>
        {hide && <FontAwesomeIcon icon={faLock} />}
      </div>
      <div className="group-btn">
        <ZButton type="reset" onClick={onCancel} className="secondary">
          {t('Back')}
        </ZButton>
        &nbsp;
        <ZButton onClick={handleOnSubmit}>{t('Confirm')}</ZButton>
      </div>
    </div>
  )
}

export default GenerateSeedPhraseForm
