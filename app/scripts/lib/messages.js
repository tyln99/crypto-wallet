const messages = {
  errors: {
    disconnected: () => 'ZWallet: Disconnected from chain. Attempting to connect.',
    permanentlyDisconnected: () =>
      'ZWallet: Disconnected from ZWallet background. Page reload required.',
    sendSiteMetadata: () =>
      `ZWallet: Failed to send site metadata. This is an internal error, please report this bug.`,
    unsupportedSync: (method) =>
      `ZWallet: The ZWallet Ethereum provider does not support synchronous methods like ${method} without a callback parameter.`,
    invalidDuplexStream: () => 'Must provide a Node.js-style duplex stream.',
    invalidNetworkParams: () =>
      'ZWallet: Received invalid network parameters. Please report this bug.',
    invalidRequestArgs: () => `Expected a single, non-array, object argument.`,
    invalidRequestMethod: () => `'args.method' must be a non-empty string.`,
    invalidRequestParams: () => `'args.params' must be an object or array if provided.`,
    invalidLoggerObject: () => `'args.logger' must be an object if provided.`,
    invalidLoggerMethod: (method) => `'args.logger' must include required method '${method}'.`,
    walletNotExists: () => `Wallet doesn't exists, let's import or create a new one!`,
    incorrectPassword: () => `Incorrect password`
  },
  info: {
    connected: (chainId) => `ZWallet: Connected to chain with ID "${chainId}".`
  },
  warnings: {
    // deprecated methods
    enableDeprecation: `ZWallet: 'ethereum.enable()' is deprecated and may be removed in the future. Please use the 'eth_requestAccounts' RPC method instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1102`,
    sendDeprecation: `ZWallet: 'ethereum.send(...)' is deprecated and may be removed in the future. Please use 'ethereum.sendAsync(...)' or 'ethereum.request(...)' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193`,
    // deprecated events
    events: {
      close: `ZWallet: The event 'close' is deprecated and may be removed in the future. Please use 'disconnect' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#disconnect`,
      data: `ZWallet: The event 'data' is deprecated and will be removed in the future. Use 'message' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#message`,
      networkChanged: `ZWallet: The event 'networkChanged' is deprecated and may be removed in the future. Use 'chainChanged' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#chainchanged`,
      notification: `ZWallet: The event 'notification' is deprecated and may be removed in the future. Use 'message' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#message`
    },
    // misc
    experimentalMethods: `ZWallet: 'ethereum._ZWallet' exposes non-standard, experimental methods. They may be removed or changed without warning.`
  }
}
export default messages
