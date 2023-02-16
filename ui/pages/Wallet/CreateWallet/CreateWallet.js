import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import unlock2Img from '@resources/images/Unlock_2.png'
import '../GetWallet/GetWallet.scss'
import { useTranslation } from 'react-i18next'
import './CreateWallet.scss'
import { ProgressBar } from 'react-bootstrap'
import { CreatePasswordForm, GenerateSeedPhraseForm } from '@components/Forms'
import Footer from '@components/ZLayout/Footer'
import ConfirmRecoveryPhraseChips from '@components/ConfirmRecoveryPhraseChips'
import * as actions from '@store/actions'
import { useHistory } from 'react-router'
import { LOGIN_ROUTE } from '@shared/constant/routes'
import { logErr } from '@shared/util/logger'
import useToast from '@hooks/useToast'

const TOTAL_STEPS = 3
const FIRST_STEP = 1

function CreateWallet() {
  const { t } = useTranslation()
  const history = useHistory()
  const toast = useToast()

  const [currentStep, setCurrentStep] = useState(0)
  const [password, setPassword] = useState()
  const [seed, setSeed] = useState()

  useEffect(() => {
    setCurrentStep(FIRST_STEP)
  }, [])

  const currentProgress = (currentStep / TOTAL_STEPS) * 100

  const handleSubmitPassword = (password) => {
    setPassword(password)
    setCurrentStep(currentStep + 1)
  }

  const handleGenerateSeed = (seed) => {
    setSeed(seed)
    setCurrentStep(currentStep + 1)
  }

  const handleConfirmedSeed = async () => {
    try {
      actions.clearImportedAccounts()
      await actions.createNewWallet(seed, password)
      history.push(LOGIN_ROUTE)
    } catch (error) {
      logErr({ error, data: { seed, password } })
      return toast.error(error.message || 'Something went wrong!')
    }
  }

  const renderForm = (step) => {
    switch (step) {
      case 1:
        return (
          <div className="step step-1">
            <h2 className="title">{t('Create Password')}</h2>
            <CreatePasswordForm onSubmit={handleSubmitPassword} />
          </div>
        )
      case 2:
        return (
          <div className="step step-2">
            <h2 className="title">{t('Secret Recovery Phrase')}</h2>
            <GenerateSeedPhraseForm
              onSubmit={handleGenerateSeed}
              onCancel={() => setCurrentStep(1)}
            />
          </div>
        )
      case 3:
        return (
          seed && (
            <div className="step step-1">
              <h2 className="title">{`${t('Confirm')} ${t('Secret Recovery Phrase')}`}</h2>
              <ConfirmRecoveryPhraseChips
                phrases={seed.split(' ')}
                onCancel={() => setCurrentStep(2)}
                onConfirmed={handleConfirmedSeed}
              />
            </div>
          )
        )
      default:
        break
    }
  }

  return (
    <div className="create-wallet-container">
      <div className="gallery">
        <img alt="" src={unlock2Img} />
      </div>
      <main>
        <h2 className="title">{t('Create new Wallet')}</h2>
        <ProgressBar now={currentProgress} />
        <div className="steps">{renderForm(currentStep)}</div>
      </main>
      <Footer />
    </div>
  )
}

export default CreateWallet
