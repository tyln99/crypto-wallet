import { find, remove, shuffle } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ZButton } from '../ZButtons'
import './ConfirmRecoveryPhraseChips.scss'

function ConfirmRecoveryPhraseChips({ phrases = [], onConfirmed, onCancel }) {
  const [hasError, setHasError] = useState(false)

  const [shuffledPhrases, setShuffledPhrases] = useState()
  const [selectedSeeds, setSelectedSeeds] = useState([])

  const { t } = useTranslation()

  useEffect(() => {
    setShuffledPhrases(shuffle(phrases))
  }, [])

  const handleOnSubmit = () => {
    for (let i = 0; i < phrases.length; i++) {
      if (phrases[i] !== selectedSeeds[i]?.value) {
        return setHasError(true)
      }
    }
    onConfirmed && onConfirmed()
  }

  const handleOnRemoveSelected = (id) => {
    setHasError(false)
    remove(selectedSeeds, (item) => {
      return item.id === id
    })
    setSelectedSeeds([...selectedSeeds])
  }

  const handleOnSelectSeed = (value, id, isActive) => {
    setHasError(false)
    if (isActive) {
      handleOnRemoveSelected(id)
    } else {
      selectedSeeds.push({ id, value })
      setSelectedSeeds([...selectedSeeds])
    }
  }

  return (
    <div className="confirm-phrase-form">
      <div className="selected-seeds">
        {selectedSeeds &&
          selectedSeeds.map((item, _) => {
            return (
              <button
                onClick={() => handleOnRemoveSelected(item.id)}
                className="seed-button"
                key={item.id}
              >
                {item.value}
              </button>
            )
          })}
      </div>
      <div className="seed-buttons">
        {shuffledPhrases &&
          shuffledPhrases.map((word, id) => {
            const isActive = find(selectedSeeds, { id, value: word })
            return (
              <button
                onClick={() => handleOnSelectSeed(word, id, isActive)}
                className={`seed-button ${isActive ? 'active' : ''}`}
                key={id}
              >
                {word}
              </button>
            )
          })}
      </div>
      {hasError && (
        <Alert className="err-msg" variant="danger">
          {t('The Phrases you provided is incorrect')}
        </Alert>
      )}
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

export default ConfirmRecoveryPhraseChips
