import { log } from '@shared/util/logger'
import EventEmitter from 'events'
import ObservableStore from '../../shared/util/obs-store'

/**
 * Manage user authentication
 */
export default class AppController extends EventEmitter {
  constructor(opts) {
    log('Init AppController: ', opts)
    super()
    this.memStore = new ObservableStore({
      isUnlocked: false,
      authenticate: {},
      zwallet: opts.zwallet || null,
      timeout: opts.timeout || 0 // by miliseconds
    })
    this.setTimeOutForAppState()
  }

  setTimeOutForAppState() {
    const { zwallet, timeout } = this.memStore.getState()
    if (timeout > 0 && zwallet) {
      setTimeout(() => {
        this.setLocked().then(() => {
          zwallet.clearZWallet()
        })
        return () => clearTimeout()
      }, timeout)
    }
  }

  async unlockKeyrings(password) {
    this.password = password
  }

  setUnlocked() {
    this.memStore.updateState({ isUnlocked: true })
    this.setTimeOutForAppState()
    this.emit('unlock')
  }

  async setLocked() {
    // set locked
    this.password = null
    this.memStore.updateState({ isUnlocked: false })
    this.emit('Lock')
  }

  checkUnlocked() {
    return this.memStore.getState().isUnlocked
  }
}
