import { combineReducers } from 'redux'
import { common } from './common.reducer'
import { account } from './account.reducer'
import { network } from './network.reducer'
import { token } from './token.reducer'

export default combineReducers({
  common,
  account,
  network,
  token
})
