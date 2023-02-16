import { READ_METHODS, WRITE_METHODS } from '@shared/constant/app'

/**
 * @deprecated
 */
export const isReadMethod = (abi, methodName) => {
  for (const method of abi) {
    if (method.name === methodName) {
      if (
        method.stateMutability === 'view' ||
        method.stateMutability === 'pure' ||
        method.constant ||
        READ_METHODS.includes(method.name)
      ) {
        return true
      } else if (method.stateMutability === 'nonpayable' || WRITE_METHODS.includes(method.name)) {
        return false
      }
    }
  }
  throw new Error("Method or ABI aren't valid!")
}
