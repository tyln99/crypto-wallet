import ActionType from '@actions/types'

export const accountInitialState = {
  selectedAccount: null,
  listAccounts: null
}

export function account(state = accountInitialState, action) {
  switch (action.type) {
    case ActionType.SET_SELECTED_ACCOUNT:
      return {
        ...state,
        selectedAccount: action.payload
      }
    case ActionType.SET_LIST_ACCOUNTS:
      return {
        ...state,
        listAccounts: action.payload
      }
    default:
      break
  }
  return state
}
