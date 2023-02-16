import { isSafeChainId, isPrefixedFormattedHexString } from './network.util'

describe('Network utils', () => {
  describe('isSafeChainId', () => {
    it('should return is chainId safe', () => {
      expect(isSafeChainId('0x9999999999999999999')).toBe(false)
    })
  })

  describe('isPrefixedFormattedHexString', () => {
    it('should retrun false if value is not string', () => {
      expect(isPrefixedFormattedHexString(123123)).toBe(false)
    })

    it('should return frefixed or not', () => {
      expect(isPrefixedFormattedHexString('0x61')).toBe(true)
    })
  })
})
