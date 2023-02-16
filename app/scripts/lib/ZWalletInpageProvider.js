/**
 * Inpage provider: export public api interface for dapp
 */

import ObjectMultiplex from 'obj-multiplex'
import pump from 'pump'
import {
  JsonRpcEngine,
  createIdRemapMiddleware,
  JsonRpcRequest,
  JsonRpcId,
  JsonRpcVersion,
  JsonRpcSuccess,
  JsonRpcMiddleware
} from 'json-rpc-engine'
import { createStreamMiddleware } from 'json-rpc-middleware-stream'
import SafeEventEmitter from '@metamask/safe-event-emitter' //replace by events
import { ethErrors, EthereumRpcError } from 'eth-rpc-errors'
import { duplex as isDuplex } from 'is-stream'
import messages from './messages'
import { log, logErr, logWarn } from '@shared/util/logger'
import { EMIT_METHODS } from '@shared/constant/app'

/**
 * @class
 */
export default class ZWalletInpageProvider extends SafeEventEmitter {
  constructor(
    connectionStream,
    { jsonRpcStreamName = 'zwallet-provider', logger = console, maxEventListeners = 100 }
  ) {
    super()
    log('Init ZWalletInpageProvider')

    if (!isDuplex(connectionStream)) {
      throw new Error(messages.errors.invalidDuplexStream())
    }

    this._log = logger

    this.setMaxListeners(maxEventListeners)

    // private state
    /*       this._state = {
             ...BaseProvider._defaultState,
           };
        */
    // public state
    this.selectedAddress = null
    this.chainId = null
    this.isUnlocked = null
    this.isConnected = null
    //this._rpcRequest = this._rpcRequest.bind(this);// off public _rpcRequest to dApp
    this.request = this.request.bind(this)
    this._handleStreamDisconnect = this._handleStreamDisconnect.bind(this)

    const mux = new ObjectMultiplex()
    pump(
      connectionStream,
      mux,
      connectionStream,
      this._handleStreamDisconnect.bind(this, 'ZWallet')
    )
    // setup RPC connection
    this._jsonRpcConnection = createStreamMiddleware()
    pump(
      this._jsonRpcConnection.stream,
      mux.createStream(jsonRpcStreamName),
      this._jsonRpcConnection.stream,
      this._handleStreamDisconnect.bind(this, 'ZWallet RpcProvider')
    )

    // handle RPC requests via dapp-side rpc engine
    const rpcEngine = new JsonRpcEngine()
    //push middleware for generator id
    rpcEngine.push(createIdRemapMiddleware())
    //rpcEngine.push(createErrorMiddleware(this._log));
    //push middleware for backgound process
    rpcEngine.push(this._jsonRpcConnection.middleware)
    //for rpc test middleware process req from dApp
    /*rpcEngine.push(function (req, res, next, end) {
       log('req:',req)
       log('res:',res)
       res.result = "Hello result data";
       end();
     });*/

    this._rpcEngine = rpcEngine

    // handle JSON-RPC notifications
    this._jsonRpcConnection.events.on('notification', (payload) => {
      const { method, params } = payload
      if (method === EMIT_METHODS.CHAIN_CHANGED) {
        return this._handleChainChanged(params)
      } else if (method === EMIT_METHODS.ACCOUNT_CHANGED) {
        return this._handleAccountChanged(params)
      } else if (method === EMIT_METHODS.ETH_SUBSCRIPTION) {
        // eth_subscription
        return this.emit('message', {
          type: method,
          data: params
        })
      } else this.emit('data', payload)
    })

    this._initializeStateAsync()
  }

  async _initializeStateAsync() {
    let initialState

    try {
      initialState = await this.request({
        method: 'zwallet_getProviderState'
      })
      const { chainId, isUnlocked, selectedAddress } = initialState
      log('initialState', initialState)
      this._handleConnect(chainId)
      this._handleChainChanged(chainId)
      this._handleAccountChanged(selectedAddress)
      this._handleUnlock(isUnlocked)
    } catch (error) {
      logErr({
        error,
        data: { message: 'ZWallet: Failed to get initial state. Please report this bug.' }
      })
    }
  }

  _handleUnlock(isUnlocked) {
    this.isUnlocked = isUnlocked
  }

  _handleConnect(chainId) {
    log('_handleConnect', chainId)
    this.isConnected = true
    this.emit(EMIT_METHODS.CONNECT, chainId)
  }

  _handleAccountChanged(addr) {
    log('_handleAccountChanged', addr)
    this.selectedAddress = addr
    this.emit(EMIT_METHODS.ACCOUNT_CHANGED, addr)
  }

  _handleChainChanged(chainId) {
    log('_handleChainChanged', chainId)
    this._handleConnect(chainId)
    this.chainId = chainId
    this.emit(EMIT_METHODS.CHAIN_CHANGED, chainId)
  }

  _handleStreamDisconnect(streamName, error) {
    let warningMsg = `ZWallet: Lost connection to "${streamName}".`
    if (error?.stack) {
      warningMsg += `\n${error.stack}`
    }

    logWarn(warningMsg)
    // if (this.listenerCount('error') > 0) {
    this.emit(EMIT_METHODS.ERROR, warningMsg)
    // }

    this._handleDisconnect(false, error ? error.message : undefined)
  }

  _handleDisconnect(isRecoverable, errorMessage) {
    if (this.isConnected) {
      this.isConnected = false

      let error
      if (isRecoverable) {
        error = new EthereumRpcError(
          1013, // Try again later
          errorMessage || messages.errors.disconnected()
        )
        this._log.debug(error)
      } else {
        error = new EthereumRpcError(
          1011, // Internal error
          errorMessage || messages.errors.permanentlyDisconnected()
        )
        this._log.error(error)
        this.chainId = null
        this.accounts = null
        this.selectedAddress = null
        this.isUnlocked = false
        this.isPermanentlyDisconnected = true
      }

      this.emit(EMIT_METHODS.DISCONNECT, error)
    }
  }

  _rpcRequest(payload, callback) {
    let cb = callback
    if (!Array.isArray(payload)) {
      if (!payload.jsonrpc) {
        payload.jsonrpc = '2.0'
      }

      if (payload.method === 'eth_accounts' || payload.method === 'eth_requestAccounts') {
        // handle accounts changing
        cb = (err, res) => {
          /*  this._handleAccountsChanged(
              res.result || [],
              payload.method === 'eth_accounts',
            ); */
          callback(err, res)
        }
      }
      return this._rpcEngine.handle(payload, cb)
    }
    return this._rpcEngine.handle(payload, cb)
  }

  async request(args) {
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestArgs(),
        data: args
      })
    }

    const { method, params } = args

    if (typeof method !== 'string' || method.length === 0) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestMethod(),
        data: args
      })
    }

    if (
      params !== undefined &&
      !Array.isArray(params) &&
      (typeof params !== 'object' || params === null)
    ) {
      throw ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestParams(),
        data: args
      })
    }

    return new Promise((resolve, reject) => {
      this._rpcRequest({ method, params }, getRpcPromiseCallback(resolve, reject))
    })
  }
}

const getRpcPromiseCallback = (resolve, reject, unwrapResult = true) => (error, response) => {
  if (error || response.error) {
    reject(error || response.error)
  } else {
    !unwrapResult || Array.isArray(response) ? resolve(response) : resolve(response.result)
  }
}
