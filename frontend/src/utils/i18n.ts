import type { CompanyBase, CompanyBrief } from '../types';

/**
 * 获取公司名称（根据当前语言自动选择）
 * - 中文环境：始终显示中文名称
 * - 英文环境：优先显示英文名称，如果没有则显示中文名称
 *
 * @param company 公司对象
 * @param language 当前语言 ('zh' | 'en')
 * @returns 公司名称
 */
export function getCompanyName(
  company: CompanyBase | CompanyBrief | null | undefined,
  language: string = 'zh'
): string {
  if (!company) return '';

  // 英文环境下优先使用英文名称
  if (language === 'en' && company.name_en) {
    return company.name_en;
  }

  // 默认使用中文名称
  return company.name;
}

/**
 * 周末政策术语映射
 */
const weekendPolicyMap: Record<string, { zh: string; en: string }> = {
  'double_rest': { zh: '双休', en: 'Double Day Off' },
  'big_small_week': { zh: '大小周', en: 'Big/Small Week' },
  'single_rest': { zh: '单休', en: 'Single Day Off' },
  'no_rest': { zh: '无休', en: 'No Day Off' },
};

/**
 * 加班补偿术语映射
 */
const overtimeCompensationMap: Record<string, { zh: string; en: string }> = {
  'legal': { zh: '法定标准', en: 'Legal Rate' },
  'fixed_subsidy': { zh: '固定补贴', en: 'Fixed Subsidy' },
  'time_off': { zh: '调休', en: 'Time Off' },
  'none': { zh: '无补偿', en: 'No Compensation' },
};

/**
 * 轮班制度术语映射
 */
const shiftPolicyMap: Record<string, { zh: string; en: string }> = {
  'no_shift': { zh: '不轮班', en: 'No Shifts' },
  'occasional': { zh: '偶尔轮班', en: 'Occasional Shifts' },
  'regular': { zh: '定期轮班', en: 'Regular Shifts' },
  'rotating': { zh: '轮班制', en: 'Rotating Shifts' },
};

/**
 * 获取术语的国际化翻译
 * @param term 数据库中的原始术语值
 * @param category 术语类别 ('weekend_policy' | 'overtime_compensation' | 'shift_policy')
 * @param language 当前语言 ('zh' | 'en')
 * @returns 国际化后的术语文本，如果未找到则返回原始值
 */
export function getTermTranslation(
  term: string | null | undefined,
  category: 'weekend_policy' | 'overtime_compensation' | 'shift_policy',
  language: string = 'zh'
): string {
  if (!term) return '--';

  let map: Record<string, { zh: string; en: string }>;

  switch (category) {
    case 'weekend_policy':
      map = weekendPolicyMap;
      break;
    case 'overtime_compensation':
      map = overtimeCompensationMap;
      break;
    case 'shift_policy':
      map = shiftPolicyMap;
      break;
    default:
      return term;
  }

  const translation = map[term];
  if (translation) {
    return language === 'en' ? translation.en : translation.zh;
  }

  // 如果未找到映射，返回原始值
  return term;
}
