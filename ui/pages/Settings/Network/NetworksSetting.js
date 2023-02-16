import React, { useEffect, useRef, useState } from 'react'
import './NetworksSetting.scss'
import * as actions from '@store/actions'
import NetworkForm from './NetworkForm'
import { ZButton } from '@ui/components/ZButtons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

function NetworksSetting() {
  const [networks, setNetworks] = useState()
  const [formData, setFormData] = useState()
  const [isShowCreate, setIsShowCreate] = useState(false)
  const isMounted = useRef(false)
  const { t } = useTranslation()

  useEffect(() => {
    fetchNetworks()
    return () => {
      isMounted.current = true
    }
  }, [])

  const fetchNetworks = async () => {
    try {
      const networks = await actions.getNetworks()
      if (!isMounted.current) {
        setNetworks(networks)
        if (!formData) {
          setFormData(networks[Object.keys(networks)[0]])
        }
      }
    } catch (error) {}
  }

  const onRemoveCustomNetwork = async (id) => {
    try {
      await actions.removeCustomNetwork(id)
      if (id === formData.id) {
        setFormData(networks['ropsten'])
      }
      fetchNetworks()
    } catch (error) {}
  }

  const renderEditContent = () => {
    if (networks && formData)
      return (
        <main>
          <div className="networks-list">
            {Object.keys(networks).map((key, index) => (
              <div
                key={index}
                className={`network-item ${networks[key].id === formData.id && 'active'}`}
              >
                <span
                  className="network-name"
                  onClick={() => {
                    if (networks[key].id !== formData.id) {
                      setFormData(networks[key])
                    }
                  }}
                >
                  {networks[key].name}
                </span>
                <span>
                  {networks[key].isMutable ? (
                    <div onClick={() => onRemoveCustomNetwork(networks[key].id)}>
                      <FontAwesomeIcon icon={faTrashCan} color="#cc0000" />
                    </div>
                  ) : (
                    <FontAwesomeIcon icon={faLock} />
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="network-info">
            <NetworkForm
              submit={async () => {
                await fetchNetworks()
              }}
              initData={formData}
              action={'update'}
            />
          </div>
        </main>
      )
    else return <></>
  }

  const renderCreateContent = () => {
    return (
      <div className="add-network-form">
        <NetworkForm
          submit={async () => {
            await fetchNetworks()
            setIsShowCreate(false)
          }}
          action={'Create'}
        />
      </div>
    )
  }

  return (
    <div className="networks-setting-content">
      <div className="networks-setting-header">
        <h2>
          <span style={{ opacity: isShowCreate ? 0.5 : 1 }}>{t('Networks')}</span>{' '}
          {isShowCreate && `> ${t('Create')}`}
        </h2>
        <ZButton onClick={() => setIsShowCreate((curr) => !curr)}>
          {isShowCreate ? t('Back') : t('Add network')}
        </ZButton>
      </div>
      {isShowCreate ? renderCreateContent() : renderEditContent()}
    </div>
  )
}

export default NetworksSetting
