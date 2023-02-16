import ActionType from '@actions/types'

export const networkInitialState = {
  selectedNetwork: null,
  listNetworks: null
}

export function network(state = networkInitialState, action) {
  switch (action.type) {
    case ActionType.SET_SELECTED_NETWORK:
      return {
        ...state,
        selectedNetwork: action.payload
      }
    case ActionType.SET_LIST_NETWORKS:
      return {
        ...state,
        listNetworks: action.payload
      }
    default:
      break
  }
  return state
}
