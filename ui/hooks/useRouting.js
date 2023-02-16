import { MESSAGE_TYPE } from '@shared/constant/app'
import {
  ACCOUNT_ROUTE,
  CONNECT_ACCOUNT_ROUTE,
  REQUEST_SEND_TRANSACTION_ROUTE,
  SIGNATURE_ROUTE,
  SWITCH_NETWORK_ROUTE
} from '@shared/constant/routes'
import { useHistory } from 'react-router'

export const useRouting = () => {
  const history = useHistory()

  const detectRoute = async (data) => {
    let path = ACCOUNT_ROUTE
    if (data && data.type) {
      switch (data.type) {
        case MESSAGE_TYPE.ETH_SIGN: {
          path = SIGNATURE_ROUTE
          break
        }
        case MESSAGE_TYPE.SWITCH_ETHEREUM_CHAIN: {
          path = SWITCH_NETWORK_ROUTE
          break
        }
        case MESSAGE_TYPE.WALLET_REQUEST_PERMISSIONS: {
          path = CONNECT_ACCOUNT_ROUTE
          break
        }
        case MESSAGE_TYPE.WALLET_SEND_TRANSACTION: {
          path = REQUEST_SEND_TRANSACTION_ROUTE
          break
        }
        default:
          break
      }
    }
    history.push(path)
  }

  return { detectRoute }
}
