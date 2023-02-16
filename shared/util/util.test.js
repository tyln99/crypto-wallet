import { addHexPrefix, isValidHttpUrl } from './util'

describe('util', () => {
  describe('addHexPrefix', () => {
    it('should return value with nothing change', () => {
      expect(addHexPrefix('0x12')).toBe('0x12')
    })
    it('should return value with lowered case hex prefix', () => {
      expect(addHexPrefix('-12')).toBe('-0x12')
    })
    it('should return value with negative number', () => {
      expect(addHexPrefix('-12')).toBe('-0x12')
    })

    it('should return value with prefix', () => {
      expect(addHexPrefix('12')).toBe('0x12')
    })
  })

  describe('isValidHttpUrl', () => {
    it('should return false if string invalid', () => {
      expect(isValidHttpUrl('abcd')).toBe(false)
    })
    it('should return false if url is http', () => {
      expect(isValidHttpUrl('https://google.com')).toBe(true)
    })
  })
})
