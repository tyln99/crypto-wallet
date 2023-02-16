import { log } from '@shared/util/logger'
import { ethErrors } from 'eth-rpc-errors'

/**
 * Manage user confirmation
 * @class
 */
export default class ApprovalController {
  constructor({ showApprovalRequest, state }) {
    this._showApprovalRequest = showApprovalRequest
    this._approvals = new Map()
  }

  addAndShowApprovalRequest(opts) {
    log('addAndShowApprovalRequest', opts)
    const promise = this._add(opts.origin, opts.type, opts.id, opts.requestData)
    this._showApprovalRequest(opts)
    return promise
  }

  /**
   * User press Accept
   *
   * @param {*} id - request id
   * @param {*} value
   */
  accept(id, value) {
    log('accept', id, value)
    this._deleteApprovalAndGetCallbacks(id).resolve(value)
  }

  /**
   * User press Reject
   *
   * @param {*} id - request id
   * @param {*} error
   */
  reject(id, error) {
    log('reject', id, error)
    this._deleteApprovalAndGetCallbacks(id).reject(error)
  }

  _add(origin, type, id, requestData) {
    this._validateAddParams(origin, type, id, requestData)

    // add pending approval
    return new Promise((resolve, reject) => {
      this._approvals.set(id, { resolve, reject })
      log('this._approvals', this._approvals)
      //   this._addPendingApprovalOrigin(origin, type)
      //   this._addToStore(id, origin, type, requestData)
    })
  }

  _delete(id) {
    this._approvals.delete(id)
    log('this._approvals', this._approvals)
  }

  _deleteApprovalAndGetCallbacks(id) {
    const callbacks = this._approvals.get(id)
    if (!callbacks) {
      throw new Error(`Approval request with id '${id}' not found.`)
    }

    this._delete(id)
    return callbacks
  }

  _validateAddParams(origin, type, id, requestData) {
    let errorMessage = null
    if (!id || typeof id !== 'string') {
      errorMessage = 'Must specify non-empty string id.'
    } else if (this._approvals.has(id)) {
      errorMessage = `Approval request with id '${id}' already exists.`
    } else if (!origin || typeof origin !== 'string') {
      errorMessage = 'Must specify non-empty string origin.'
    } else if (!type || typeof type !== 'string') {
      errorMessage = 'Must specify non-empty string type.'
    } else if (requestData && (typeof requestData !== 'object' || Array.isArray(requestData))) {
      errorMessage = 'Request data must be a plain object if specified.'
    }

    if (errorMessage) {
      throw ethErrors.rpc.internal(errorMessage)
    }
  }
}
