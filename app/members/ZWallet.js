/**
 * Handle login and logout wallet
 */
export class ZWallet {
  constructor({ zwallet, password }) {
    this.zwallet = zwallet
    this.password = password
  }

  clearZWallet() {
    this.zwallet = {}
    this.password = ''
  }

  setZWallet({ zwallet, password }) {
    this.zwallet = zwallet
    this.password = password
  }
}
