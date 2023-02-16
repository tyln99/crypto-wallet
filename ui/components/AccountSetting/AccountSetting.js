import { ZButton } from '@components/ZButtons'
import ZModal from '@components/ZModal'
import ZTooltip from '@components/ZTooltip'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { log } from '@shared/util/logger'
import React, { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import './AccountSetting.scss'
import openOutAppIcon from '@resources/images/open_out_app.svg'
import moreDiamondIcon from '@resources/images/more_diamond.svg'
import linkIcon from '@resources/images/link.svg'
import deleteIcon from '@resources/images/delete.svg'
import editIconIcon from '@resources/images/edit.svg'
import { Field, Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useHistory } from 'react-router'
import { EDIT_ACCOUNT_ROUTE } from '@shared/constant/routes'
import { useTranslation } from 'react-i18next'

const ACCOUNT_SETTING = [
  {
    text: 'View Account on Etherscan',
    icon: openOutAppIcon,
    value: 1,
    active: true
  },
  {
    text: 'Account details',
    icon: moreDiamondIcon,
    value: 2,
    active: true
  },
  {
    text: 'Connected sites',
    icon: linkIcon,
    value: 3,
    active: true
  },
  {
    text: 'Rename',
    icon: editIconIcon,
    value: 4,
    active: true
  },
  {
    text: 'Remove account',
    icon: deleteIcon,
    value: 5,
    active: false
  }
]

function AccountSetting({ account, network, onUnlock, showConnectedSites }) {
  const [showAccountDetails, setShowAccountDetails] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState()
  const [showExportPrivateKey, setShowExportPrivateKey] = useState(false)
  const history = useHistory()
  const { t } = useTranslation()

  const onSelect = (value) => {
    switch (value) {
      case 1:
        window.open(`${network.blockExplorer}/address/${account.address}`, '_blank')
        break

      case 2:
        setShowAccountDetails(true)
        break

      case 3:
        showConnectedSites && showConnectedSites()
        break

      case 4:
        history.push(EDIT_ACCOUNT_ROUTE)
        break

      default:
        break
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(account.address)
    setIsCopied(!isCopied)
  }

  const copyPrivateKey = () => {
    navigator.clipboard.writeText(account.privateKey)
    setIsCopied(!isCopied)
  }

  const onSubmitUnlock = async ({ password }, { setErrors }) => {
    log(password)
    try {
      const success = await onUnlock(password)
      log(success)
      if (success) {
        setIsUnlocked(true)
      } else {
        setErrors({ password: 'Something went wrong!' })
      }
    } catch (error) {
      setErrors({ password: error.message || 'Something went wrong!' })
    }
  }

  return (
    <>
      <Dropdown className="account-setting">
        <Dropdown.Toggle>
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {ACCOUNT_SETTING.map((item) => (
            <Dropdown.Item
              className={item.active ? '' : 'disabled'}
              onClick={() => onSelect(item.value)}
              key={item.value}
            >
              <div className="icon">
                <img alt="" src={item.icon} />
              </div>
              <div>{t(item.text)}</div>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <ZModal
        show={showAccountDetails}
        title={t(ACCOUNT_SETTING[1].text)}
        onCancel={() => {
          setShowAccountDetails(false)
          setIsUnlocked(false)
          setShowExportPrivateKey(false)
        }}
        isShowControlButtons={false}
      >
        <div className="account-details">
          {showExportPrivateKey ? (
            <div className="privateKey-group">
              <div className="alert alert-warning">
                {t(
                  'Warning: Never disclose this key. Anyone with your private keys can steal any assets held in your account.'
                )}
              </div>
              {isUnlocked ? (
                <ZTooltip
                  content={isCopied ? t('Copied') : t('Copy to clipboard')}
                  onShow={() => {
                    setIsCopied(false)
                    return true
                  }}
                >
                  <div onClick={copyPrivateKey} className="privateKey">
                    {account.privateKey}
                  </div>
                </ZTooltip>
              ) : (
                <Formik
                  initialValues={{
                    password: ''
                  }}
                  validationSchema={Yup.object().shape({
                    password: Yup.string().required('Password is required')
                  })}
                  onSubmit={onSubmitUnlock}
                >
                  {({ errors, touched, isSubmitting }) => {
                    return (
                      <Form className="zForm">
                        <div
                          className={`form-group ${
                            errors.password && touched.password ? 'error' : ''
                          }`}
                        >
                          <label>{t('Password')}</label>
                          <Field type="password" name="password" className="form-control" />
                          <p className="err-msg">
                            {errors.password && touched.password ? `${t(errors.password)}` : ''}
                          </p>
                        </div>
                        <ZButton
                          disabled={isSubmitting}
                          className="show-export-private-key-btn"
                          type="submit"
                        >
                          {t('Confirm')}
                        </ZButton>
                      </Form>
                    )
                  }}
                </Formik>
              )}
            </div>
          ) : (
            <>
              <ZTooltip
                placement="top"
                content={isCopied ? t('Copied') : t('Copy to clipboard')}
                onShow={() => {
                  setIsCopied(false)
                  return true
                }}
              >
                <div onClick={copyAddress} className="address">
                  {account.address}
                </div>
              </ZTooltip>
              <ZButton
                className="show-export-private-key-btn"
                onClick={() => setShowExportPrivateKey(true)}
              >
                {t('Export Private Key')}
              </ZButton>
            </>
          )}
        </div>
      </ZModal>
    </>
  )
}

export default AccountSetting
