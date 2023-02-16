import ActionType from '@actions/types'

export const setSelectedAccount = (account) => {
  return {
    type: ActionType.SET_SELECTED_ACCOUNT,
    payload: account
  }
}

export const setListAccounts = (accounts) => {
  return {
    type: ActionType.SET_LIST_ACCOUNTS,
    payload: accounts
  }
}

export const setSelectedNetwork = (network) => {
  return {
    type: ActionType.SET_SELECTED_NETWORK,
    payload: network
  }
}

export const setDappOptions = (options) => {
  return {
    type: ActionType.SET_DAPP_OPTIONS,
    payload: options
  }
}

export const setSelectedToken = (token) => {
  return {
    type: ActionType.SET_SELECTED_TOKEN,
    payload: token
  }
}
