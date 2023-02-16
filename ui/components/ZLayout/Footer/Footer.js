import { LANGUAGE_CODE, LANGUAGE_CODE_TO_NAME_MAP } from '@shared/constant/language'
import React from 'react'
import { useTranslation } from 'react-i18next'
import './Footer.scss'
const { VI, EN } = LANGUAGE_CODE

function Footer() {
  const { i18n } = useTranslation()

  const renderFooterContent = () => {
    switch (i18n.language) {
      case EN:
        return (
          <button onClick={() => i18n.changeLanguage(VI)}>{LANGUAGE_CODE_TO_NAME_MAP[EN]}</button>
        )

      case VI:
        return (
          <button onClick={() => i18n.changeLanguage(EN)}>{LANGUAGE_CODE_TO_NAME_MAP[VI]}</button>
        )

      default:
        break
    }
  }
  return <footer>{renderFooterContent()}</footer>
}

export default Footer
