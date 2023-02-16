import { fromWei, toWei } from './converter'

describe('converter', () => {
  describe('fromWei', () => {
    it('should return 0 if value is not number', () => {
      expect(fromWei('asdfasdf')).toBe(0)
    })

    it('should return value from wei per unit', () => {
      expect(fromWei(1000000000000000000)).toBe('1')
    })
  })
  describe('toWei', () => {
    it('should return 0 if value is not number', () => {
      expect(toWei('asdfasdf')).toBe(0)
    })

    it('should return value from wei per unit', () => {
      expect(toWei(1)).toBe('1000000000000000000')
    })
  })
})
