import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import './RecoveryPhraseChips.scss'

const initValues = Array.from({ length: 12 }, () => '')
const initShow = Array.from({ length: 12 }, () => false)

function RecoveryPhraseChips({ onChange }) {
  const [phrases, setPhrases] = useState(initValues)
  const [phrasesShow, setPhraseShow] = useState(initShow)

  const handleTextBoxChange = (id, text) => {
    phrases[id] = text
    setPhrases([...phrases])
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('Text')
    const splitted = pasted.split(' ')
    const newPhrases = Array.from({ length: 12 }, () => '')
    newPhrases.forEach((value, id) => {
      newPhrases[id] = splitted[id]
    })
    setPhrases(newPhrases)
  }

  useEffect(() => {
    const value = phrases.reduce((prev, curr) => prev + curr + ' ', '')
    onChange && onChange(value.trim())
  }, [phrases])

  return (
    <div className="recovery-phrase-chips">
      {phrases.map((word, id) => (
        <div className="chip" key={id}>
          <div className="counter">{`${id + 1}. `}</div>
          <div className="show-and-hide-password-input">
            <input
              onPaste={handlePaste}
              className="form-control"
              type={phrasesShow[id] ? 'text' : 'password'}
              value={word}
              onChange={(e) => handleTextBoxChange(id, e.target.value)}
            />
            <div
              onClick={() => {
                const newArr = Array.from({ length: 12 }, () => false)
                newArr[id] = !phrasesShow[id]
                setPhraseShow(newArr)
              }}
              className="button"
            >
              <FontAwesomeIcon icon={phrasesShow[id] ? faEyeSlash : faEye} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecoveryPhraseChips
