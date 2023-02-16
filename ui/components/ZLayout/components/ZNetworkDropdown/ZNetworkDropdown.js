import { faChevronDown, faCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'

import { setSelectedNetwork } from '@actions/creator'
import * as actions from '@store/actions'
import { SETTINGS_ROUTE } from '@shared/constant/routes'
import { getEnvironmentType } from '@app/scripts/lib/utils'
import { ENV_TYPE_POPUP } from '@shared/constant/app'
import { selectedNetworkSelector } from '@selectors/common.selectors'
import { useTranslation } from 'react-i18next'

function ZNetworkDropdown() {
  const [networks, setNetworks] = useState([])
  const dispatch = useDispatch()
  const isMounted = useRef(true)
  const history = useHistory()
  const selectedNetwork = useSelector(selectedNetworkSelector)
  const { t } = useTranslation()

  useEffect(() => {
    if (selectedNetwork) {
      detectNewNetwork(selectedNetwork)
    }
  }, [selectedNetwork])

  const detectNewNetwork = (newNet) => {
    if (!Object.keys(networks).includes(newNet.id)) {
      setNetworks((prevState) => {
        return {
          ...prevState,
          [newNet.id]: newNet
        }
      })
    }
  }
  const fetchNetworks = async () => {
    try {
      const networks = await actions.getNetworks()
      isMounted.current && setNetworks(networks)
    } catch (error) {}
  }
  const fetchCurrentNetwork = async () => {
    try {
      const network = await actions.getNetwork()
      if (isMounted.current) {
        dispatch(setSelectedNetwork(network))
      }
    } catch (error) {}
  }

  useEffect(() => {
    fetchNetworks()
    fetchCurrentNetwork()

    return () => {
      isMounted.current = false
    }
  }, [])

  const onSelectNetwork = async (network) => {
    if (selectedNetwork.id !== network.id) {
      try {
        actions.updateNetworkProvider(network)
        dispatch(setSelectedNetwork(network))
      } catch (error) {}
    }
  }

  return (
    <>
      {selectedNetwork && (
        <Dropdown className="network-dropdown">
          <Dropdown.Toggle className="network-info">
            <FontAwesomeIcon className="active" icon={faCircle} />
            &nbsp;&nbsp;
            {selectedNetwork.name.length > 25
              ? `${selectedNetwork.name.substring(0, 22)}...`
              : selectedNetwork.name}
            &nbsp;&nbsp;
            <FontAwesomeIcon icon={faChevronDown} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {Object.keys(networks).map((key, index) => (
              <Dropdown.Item onClick={() => onSelectNetwork(networks[key])} key={index}>
                <FontAwesomeIcon
                  className={selectedNetwork.id === networks[key].id ? 'active' : 'inactive'}
                  icon={faCircle}
                />
                &nbsp;&nbsp;
                {networks[key].name}
              </Dropdown.Item>
            ))}
            <div
              className="add-network-btn dropdown-item"
              onClick={() => {
                if (getEnvironmentType() === ENV_TYPE_POPUP) {
                  global.platform.openExtensionInBrowser(SETTINGS_ROUTE)
                } else {
                  history.push(SETTINGS_ROUTE)
                }
              }}
            >
              {t('Add network')}
            </div>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  )
}

export default ZNetworkDropdown
