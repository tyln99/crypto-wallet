import ActionType from '@actions/types'

export const initialState = {
  dappOptions: null
}

export function common(state = initialState, action) {
  switch (action.type) {
    case ActionType.SET_DAPP_OPTIONS:
      return {
        ...state,
        dappOptions: action.payload
      }

    default:
      break
  }
  return state
}
