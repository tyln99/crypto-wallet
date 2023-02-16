import React from 'react'
import { useHistory } from 'react-router'
import { CREATE_WALLET_ROUTE, IMPORT_WALLET_ROUTE } from '@shared/constant/routes'
import unlockImg from '@resources/images/Unlock.png'
import importWalletIcon from '@resources/images/import-wallet.svg'
import createWalletIcon from '@resources/images/create-wallet.svg'
import './GetWallet.scss'
import { ZButton } from '@ui/components/ZButtons'
import { useTranslation } from 'react-i18next'

function GetWallet() {
  const history = useHistory()
  const { t } = useTranslation()

  return (
    <div className="new-wallet-container">
      <div className="gallery">
        <img alt="" src={unlockImg} />
      </div>
      <h2 className="title">{t('New to ZWallet')}?</h2>
      <main>
        <div className="wallet-option">
          <img className="icon" alt="" src={importWalletIcon} />
          <p className="description">{t('No, I already have a seed phrases')}</p>
          <ZButton onClick={() => history.push(IMPORT_WALLET_ROUTE)}>{t('Import Wallet')}</ZButton>
        </div>
        <div className="divider"></div>
        <div className="wallet-option">
          <img className="icon" alt="" src={createWalletIcon} />
          <p className="description">{t(`Yes, let's get set up`)}!</p>
          <ZButton onClick={() => history.push(CREATE_WALLET_ROUTE)}>
            {t('Create a Wallet')}
          </ZButton>
        </div>
      </main>
    </div>
  )
}

export default GetWallet
