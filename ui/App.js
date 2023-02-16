import React, { useEffect } from 'react'

import ZLayout from '@components/ZLayout'
import Router from './Router'
import { useDispatch } from 'react-redux'
import { setDappOptions } from '@actions/creator'
import * as actions from '@store/actions'
import AuthProvider from '@providers/AuthProvider'
import { logCount } from '@shared/util/logger'
import useFetchAccounts from '@hooks/useFetchAccounts'
import './i18n/config'

function App({ options }) {
  const dispatch = useDispatch()
  const fetchAccounts = useFetchAccounts()

  const { backgroundConnection, activeTab, data, zwalletState } = options
  actions.setBackgroundConnection(backgroundConnection)

  useEffect(() => {
    dispatch(setDappOptions({ activeTab, data, zwalletState }))
    if (zwalletState.isUnLocked) {
      fetchAccounts.fetchListAccounts()
    }
  }, [])

  logCount('[debug] App rerender')

  return (
    <AuthProvider isUnlocked={zwalletState.isUnLocked}>
      <ZLayout>
        <Router />
      </ZLayout>
    </AuthProvider>
  )
}

export default App
