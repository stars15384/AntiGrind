export type UserRole = 'employee' | 'company';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  company_id?: string;
  company_name?: string;
  created_at: string;
}

export interface EmployeeRegister {
  username: string;
  email: string;
  password: string;
  company_email_domain: string; // 公司邮箱域名，用于验证
}

export interface CompanyRegister {
  username: string;
  email: string;
  password: string;
  company_name: string;
  company_website?: string;
  company_description?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type?: string;
}

export interface CompanyBase {
  name: string;
  name_en?: string | null;
  industry?: string | null;  // 行业分类 (GB/T 4754-2017)
  gs1_prefix?: string;
  parent_company_id?: string;
  description?: string;
  website?: string;
}

export interface CompanyCreate extends CompanyBase {}

export interface CompanyUpdate {
  name?: string;
  name_en?: string | null;
  industry?: string | null;  // 行业分类 (GB/T 4754-2017)
  gs1_prefix?: string;
  parent_company_id?: string;
  description?: string;
  website?: string;
}

export interface CompanyResponse extends CompanyBase {
  id: string;
  agi_score: number | null;
  verification_status: string;
  created_at: string;
}

export interface CompanyDetail extends CompanyResponse {
  subsidiaries: CompanyResponse[];
  work_hour_records: WorkHourRecordResponse[];
}

export interface CompanySearchResult {
  id: string;
  name: string;
  name_en?: string | null;
  industry?: string | null;  // 行业分类
  agi_score: number | null;
  verification_status: string;
}

export interface ProductBase {
  barcode: string;
  name?: string;
  brand_owner_id?: string;
  manufacturer_id?: string;
  category?: string;
}

export interface ProductCreate extends ProductBase {}

export interface ProductResponse extends ProductBase {
  id: string;
  image_url?: string;
  created_at: string;
}

export interface CompanyBrief {
  id: string;
  name: string;
  name_en?: string | null;
  industry?: string | null;  // 行业分类
  agi_score: number | null;
  verification_status: string;
}

export interface ScanResult {
  product: ProductResponse | null;
  brand_owner: CompanyBrief | null;
  manufacturer: CompanyBrief | null;
  is_oem: boolean;
  agi_score: number | null;
  recommendation: string;
}

export type WeekendPolicy = 'double_rest' | 'big_small_week' | 'single_rest' | 'no_rest';
export type OvertimeCompensation = 'legal' | 'fixed_subsidy' | 'unpaid';
export type ShiftPolicy = 'no_shift' | 'occasional' | 'frequent';

/**
 * 行业分类类型 (基于 GB/T 4754-2017 国家标准)
 */
export type IndustryCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T';

export interface WorkHourRecordBase {
  company_id: string;
  weekly_hours: number;
  weekend_policy: WeekendPolicy;
  overtime_compensation: OvertimeCompensation;
  shift_policy: ShiftPolicy;
  vibe_score?: number;
  notes?: string;
}

export interface WorkHourRecordCreate extends WorkHourRecordBase {}

export interface WorkHourRecordResponse extends WorkHourRecordBase {
  id: string;
  user_id: string;
  source: string;
  verification_count: number;
  status: string;
  created_at: string;
}

export interface WorkHourRecordVerify {
  verified: boolean;
}

export interface EvidenceBase {
  company_id: string;
  work_hour_record_id?: string;
  file_type: string;
  type: string;
}

export interface EvidenceCreate extends EvidenceBase {}

export interface EvidenceResponse extends EvidenceBase {
  id: string;
  user_id: string;
  file_path: string;
  created_at: string;
}

export interface AttendanceScreenshotResponse {
  id: string;
  user_id: string;
  company_id: string;
  source: string;
  file_path: string;
  file_type: string;
  status: string;
  created_at: string;
  verified_at?: string;
  verified_by?: string;
}

export interface CompanyAttendanceStats {
  company_id: string;
  total_screenshots: number;
  verified_count: number;
  total_employees: number;
}

export interface CertificationBase {
  company_id: string;
  type: string;
  description?: string;
}

export interface CertificationCreate extends CertificationBase {}

export interface CertificationReview {
  status: 'approved' | 'rejected';
  review_notes?: string;
}

export interface CertificationResponse extends CertificationBase {
  id: string;
  user_id: string;
  status: string;
  reviewer_id?: string;
  review_notes?: string;
  reviewed_at?: string;
  badge_url?: string;
  created_at: string;
}

export interface CertificationBadgeResponse {
  certification_id: string;
  company_name: string;
  type: string;
  badge_url: string;
  issued_at: string;
}

export interface QACreate {
  question: string;
  company_id?: string;
}

export interface QAAnswer {
  answer: string;
}

export interface QAResponse {
  id: string;
  question: string;
  answer?: string;
  company_id?: string;
  user_id: string;
  created_at: string;
}
