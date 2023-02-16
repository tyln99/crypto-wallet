import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Account from '@pages/Account/Account'
import Login from '@pages/Login'
import SendCoin from '@pages/assets/SendCoin'
import Token from '@pages/assets/Token'
import SendToken from '@pages/assets/SendToken'
import ImportAccount from '@pages/ImportAccount'
import CreateAccount from '@pages/CreateAccount'
import Signature from '@pages/Signature'
import ConnectAccount from '@pages/ConnectAccount'
import ImportToken from '@pages/ImportToken'
import Permission from '@pages/Permission'
import SwitchNetwork from '@pages/SwitchNetwork'
import RequestSendTransaction from '@pages/RequestSendTransaction'
import Coin from '@pages/assets/Coin'
import ImportNFT from '@pages/ImportNFT'
import GetWallet from '@pages/Wallet/GetWallet'
import CreateWallet from '@pages/Wallet/CreateWallet'
import ImportWallet from '@pages/Wallet/ImportWallet'
import EditAccount from '@pages/EditAccount'
import RequireAuth from '@components/RequireAuth'
import * as routes from '@shared/constant/routes'
import Settings from './pages/Settings'

const {
  ROOT_ROUTE,
  ACCOUNT_ROUTE,
  IMPORT_ACCOUNT_ROUTE,
  CREATE_ACCOUNT_ROUTE,
  CONNECT_ACCOUNT_ROUTE,
  EDIT_ACCOUNT_ROUTE,
  SIGNATURE_ROUTE,
  PERMISSION_ROUTE,
  SWITCH_NETWORK_ROUTE,
  COIN_ROUTE,
  SEND_COIN_ROUTE,
  TOKEN_ROUTE,
  SEND_TOKEN_ROUTE,
  IMPORT_NFT_ROUTE,
  IMPORT_TOKEN_ROUTE,
  REQUEST_SEND_TRANSACTION_ROUTE,
  LOGIN_ROUTE,
  GET_WALLET_ROUTE,
  CREATE_WALLET_ROUTE,
  IMPORT_WALLET_ROUTE,
  SETTINGS_ROUTE
} = routes

function Router() {
  return (
    <Switch>
      {/* protected pages */}
      <Route
        path={SETTINGS_ROUTE}
        render={() => (
          <RequireAuth>
            <Settings />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={ROOT_ROUTE}
        render={() => (
          <RequireAuth>
            <Account />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={ACCOUNT_ROUTE}
        render={() => (
          <RequireAuth>
            <Account />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={IMPORT_ACCOUNT_ROUTE}
        render={() => (
          <RequireAuth>
            <ImportAccount />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={CREATE_ACCOUNT_ROUTE}
        render={() => (
          <RequireAuth>
            <CreateAccount />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={CONNECT_ACCOUNT_ROUTE}
        render={() => (
          <RequireAuth>
            <ConnectAccount />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={EDIT_ACCOUNT_ROUTE}
        render={() => (
          <RequireAuth>
            <EditAccount />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={SIGNATURE_ROUTE}
        render={() => (
          <RequireAuth>
            <Signature />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={PERMISSION_ROUTE}
        render={() => (
          <RequireAuth>
            <Permission />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={SWITCH_NETWORK_ROUTE}
        render={() => (
          <RequireAuth>
            <SwitchNetwork />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={COIN_ROUTE}
        render={() => (
          <RequireAuth>
            <Coin />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={SEND_COIN_ROUTE}
        render={() => (
          <RequireAuth>
            <SendCoin />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={TOKEN_ROUTE}
        render={() => (
          <RequireAuth>
            <Token />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={SEND_TOKEN_ROUTE}
        render={() => (
          <RequireAuth>
            <SendToken />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={IMPORT_TOKEN_ROUTE}
        render={() => (
          <RequireAuth>
            <ImportToken />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={IMPORT_NFT_ROUTE}
        render={() => (
          <RequireAuth>
            <ImportNFT />
          </RequireAuth>
        )}
      />
      <Route
        exact
        path={REQUEST_SEND_TRANSACTION_ROUTE}
        render={() => (
          <RequireAuth>
            <RequestSendTransaction />
          </RequireAuth>
        )}
      />

      {/* public pages */}
      <Route exact path={LOGIN_ROUTE} render={() => <Login />} />
      <Route exact path={GET_WALLET_ROUTE} render={() => <GetWallet />} />
      <Route exact path={CREATE_WALLET_ROUTE} render={() => <CreateWallet />} />
      <Route exact path={IMPORT_WALLET_ROUTE} render={() => <ImportWallet />} />
    </Switch>
  )
}

export default Router
