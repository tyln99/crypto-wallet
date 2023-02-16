import { calculateTransactionFee } from '@shared/util/calculator'

describe('calculateTransactionFee', () => {
  it('should return NaN if any field invalid', () => {
    const fee = calculateTransactionFee(null, null, null)
    expect(fee).toBe(NaN)
  })
  it('should return calculated fee', () => {
    const fee = calculateTransactionFee(10, 21000, 0.1)
    expect(fee).toBe(0.10021)
  })
})
