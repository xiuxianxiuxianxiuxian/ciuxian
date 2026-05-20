import { getRealmByLevel, canBreakthrough, getNextRealm, REALM_SYSTEM } from '../../shared/types/realm'

describe('境界系统', () => {
  test('获取对应境界', () => {
    const realm1 = getRealmByLevel(15)
    expect(realm1.name).toBe('蚀感')
    
    const realm2 = getRealmByLevel(25)
    expect(realm2.name).toBe('蚀刻')
    
    const realm3 = getRealmByLevel(75)
    expect(realm3.name).toBe('蚀骨')
    
    const realm4 = getRealmByLevel(1000)
    expect(realm4.name).toBe('蚀尽')
  })
  
  test('判断是否可以突破', () => {
    expect(canBreakthrough(1, 20)).toBe(true)  // 蚀感满级可突破
    expect(canBreakthrough(1, 15)).toBe(false)  // 蚀感未满级
    
    expect(canBreakthrough(2, 50)).toBe(true)  // 蚀刻满级可突破
    expect(canBreakthrough(2, 45)).toBe(false)  // 蚀刻未满级
    
    expect(canBreakthrough(12, 1000)).toBe(false)  // 最高境界无法继续突破
  })
  
  test('获取下一境界', () => {
    const nextRealm1 = getNextRealm(1)
    expect(nextRealm1?.name).toBe('蚀刻')
    
    const nextRealm2 = getNextRealm(5)
    expect(nextRealm2?.name).toBe('蚀名')
    
    const nextRealm3 = getNextRealm(12)
    expect(nextRealm3).toBe(null)  // 最高境界没有下一境界
  })
  
  test('境界系统完整性', () => {
    expect(REALM_SYSTEM.length).toBe(12)
    expect(REALM_SYSTEM[0].name).toBe('蚀感')
    expect(REALM_SYSTEM[11].name).toBe('蚀尽')
  })
})
