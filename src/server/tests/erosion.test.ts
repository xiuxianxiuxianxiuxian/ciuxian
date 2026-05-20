import { calculateErosionValue, getErosionRiskLevel } from '../../shared/types/erosion'

describe('蚀熵系统', () => {
  test('计算异化值', () => {
    const erosions = {
      grayErosion: 50,
      crimsonErosion: 30,
      paleErosion: 20,
      darkErosion: 10
    }
    
    const result = calculateErosionValue(erosions)
    expect(result).toBe(11) // (50+30+20+10) * 0.1 = 11
  })
  
  test('异化值上限为100', () => {
    const erosions = {
      grayErosion: 500,
      crimsonErosion: 500,
      paleErosion: 500,
      darkErosion: 500
    }
    
    const result = calculateErosionValue(erosions)
    expect(result).toBe(100)
  })
  
  test('获取异化风险等级', () => {
    expect(getErosionRiskLevel(10)).toBe('安全')
    expect(getErosionRiskLevel(30)).toBe('轻度异化')
    expect(getErosionRiskLevel(60)).toBe('中度异化')
    expect(getErosionRiskLevel(80)).toBe('重度异化')
    expect(getErosionRiskLevel(100)).toBe('彻底异化')
  })
})
