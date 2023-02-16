import React from 'react'
import unlock2Img from '@resources/images/Unlock_2.png'
import { useTranslation } from 'react-i18next'
import Footer from '@components/ZLayout/Footer'
import { Alert } from 'react-bootstrap'
import { ImportWalletForm } from '@components/Forms'
import '../GetWallet/GetWallet.scss'
import './ImportWallet.scss'

function ImportWallet() {
  const { t } = useTranslation()

  return (
    <div className="import-wallet-container">
      <div className="gallery">
        <img alt="" src={unlock2Img} />
      </div>
      <main>
        <h2 className="title">{t('Reset Wallet')}</h2>
        <br />
        <p className="description">
          {t(
            `ZWallet does not keep your Secret Recovery Phrase. If you're having trouble unlocking your account, you will need to reset your wallet. You can do this by providing the Secret Recovery Phrase you used when you set up your wallet.`
          )}
        </p>
        <br />
        <Alert variant="warning" className="description">
          {t(
            'This action will delete your current wallet and Secret Recovery Phrase from this device.'
          )}
          <br />
          {t(
            `Make sure you're using the correct Secret Recovery Phrase before proceeding. You will not be able to undo this.`
          )}
        </Alert>
        <br />
        <h3 className="title title__small">{t('Secret Recovery Phrase')}</h3>
        <Alert variant="info">
          {t('You can paste your entire secret recovery phrase into any field')}
        </Alert>
        <ImportWalletForm />
      </main>
      <Footer />
    </div>
  )
}

export default ImportWallet
