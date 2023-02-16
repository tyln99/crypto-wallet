import { listAccountsSelector, selectedNetworkSelector } from '@ui/selectors/common.selectors'
import { useDispatch, useSelector } from 'react-redux'
import * as actions from '@store/actions'
import { setListAccounts, setSelectedAccount } from '@ui/actions/creator'
import useToast from './useToast'
import { logErr } from '@shared/util/logger'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

export default function useFetchAccounts() {
  const listAccounts = useSelector(listAccountsSelector)
  const selectedNetwork = useSelector(selectedNetworkSelector)
  const dispatch = useDispatch()
  const toast = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    // console.count('listAccounts updated')
    if (listAccounts) {
      fetchCurrentAccount()
    }
  }, [listAccounts])

  useEffect(() => {
    if (selectedNetwork && listAccounts) {
      fetchBalances(listAccounts)
    }
  }, [selectedNetwork])

  const fetchListAccounts = async () => {
    try {
      const [accounts, importedAccounts] = await Promise.all([
        actions.getWallet(),
        actions.getImportedAccounts()
      ])
      const accountsWithoutBalance = [...importedAccounts, ...accounts]
      dispatch(setListAccounts(accountsWithoutBalance))
      return fetchBalances(accountsWithoutBalance)
    } catch (error) {
      logErr({ error })
      toast.error(error.message || t('Something went wrong!'))
    }
  }

  const fetchBalances = async (list) => {
    let hasDiff = false // prevent rerender if balance's not change
    const accountsWithBalance = await Promise.all(
      list.map(async (acc) => {
        try {
          const balance = await actions.getBalance(acc.address)
          if (balance !== acc.balance) {
            hasDiff = true
            acc.balance = balance
          }
        } catch (error) {
          // logErr(error)
          acc.balance = 0
        }
        return acc
      })
    )
    hasDiff && dispatch(setListAccounts(accountsWithBalance))
  }

  const fetchCurrentAccount = async () => {
    try {
      const selAddr = (await actions.getZWalletState()).selectedAddress
      let selAccount
      for (var acc of listAccounts) {
        if (acc.address === selAddr) {
          selAccount = acc
        }
      }
      if (!selAccount) {
        selAccount = listAccounts[0]
        actions.updateZWalletState({ selectedAddress: selAccount.address })
      }
      dispatch(setSelectedAccount({ ...selAccount }))
    } catch (error) {}
  }

  const clearListAccounts = () => {
    dispatch(setListAccounts(null))
  }

  const removeSelectedAccount = () => {
    dispatch(setSelectedAccount(null))
  }

  return {
    fetchListAccounts,
    fetchBalances,
    fetchCurrentAccount,
    clearListAccounts,
    removeSelectedAccount
  }
}
