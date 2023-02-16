import ActionType from '@actions/types'

export const networkInitialState = {
  selectedToken: null
}

export function token(state = networkInitialState, action) {
  switch (action.type) {
    case ActionType.SET_SELECTED_TOKEN:
      return {
        ...state,
        selectedToken: action.payload
      }
    default:
      break
  }
  return state
}
