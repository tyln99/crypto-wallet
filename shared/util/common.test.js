import { miliToDate } from '@shared/util/common'

describe('miliToDate', () => {
  it('should return empty if string invalid', () => {
    expect(miliToDate('abcd')).toBe('')
  })

  it('should return string formated date', () => {
    expect(miliToDate(1660113235797)).toBe('10/08/2022')
  })
})
