import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, '请输入用户名')
    .max(50, '用户名不能超过50个字符'),
  password: z
    .string()
    .min(1, '请输入密码'),
});

export type LoginFormData = z.infer<typeof loginSchema>;


export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, '用户名至少3个字符')
      .max(50, '用户名不能超过50个字符')
      .regex(/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线'),
    email: z
      .string()
      .email('请输入有效的邮箱地址'),
    password: z
      .string()
      .min(8, '密码至少8个字符')
      .max(128, '密码不能超过128个字符')
      .regex(/[A-Z]/, '必须包含大写字母')
      .regex(/[a-z]/, '必须包含小写字母')
      .regex(/\d/, '必须包含数字')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, '必须包含特殊字符'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;


export const companySchema = z.object({
  name: z
    .string()
    .min(2, '公司名称至少2个字符')
    .max(200, '公司名称不能超过200个字符'),
  industry: z
    .string()
    .min(1, '请选择行业类型'),
  description: z
    .string()
    .max(1000, '描述不能超过1000个字符')
    .optional(),
  website: z
    .string()
    .url('请输入有效的网址')
    .or(z.literal(''))
    .optional(),
  location: z
    .string()
    .optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;


export const workHourSchema = z.object({
  company_id: z
    .string()
    .min(1, '请选择企业'),
  weekly_hours: z
    .number()
    .min(0, '工时不能为负数')
    .max(168, '周工时不能超过168小时（7×24）'),
  weekend_policy: z
    .enum(['double_rest', 'big_small_week', 'single_rest', 'no_rest'], {
      errorMap: () => ({ message: '请选择周末政策' }),
    }),
  overtime_compensation: z
    .enum(['legal', 'fixed_subsidy', 'unpaid'], {
      errorMap: () => ({ message: '请选择加班补偿方式' }),
    }),
  shift_policy: z
    .enum(['no_shift', 'occasional', 'frequent'], {
      errorMap: () => ({ message: '请选择轮班政策' }),
    }),
  vibe_score: z
    .number()
    .min(0)
    .max(10),
  notes: z
    .string()
    .max(500, '备注不能超过500个字符')
    .optional(),
});

export type WorkHourFormData = z.infer<typeof workHourSchema>;


export const certificationApplySchema = z.object({
  company_id: z
    .string()
    .min(1, '请选择企业'),
  policy_document_url: z
    .string()
    .url('请输入有效的文档URL')
    .min(1, '请提供政策文档链接'),
  evidence_urls: z
    .array(z.string().url('请输入有效的URL'))
    .max(10, '最多上传10个证据文件'),
});

export type CertificationApplyFormData = z.infer<typeof certificationApplySchema>;


export const qaQuestionSchema = z.object({
  question_text: z
    .string()
    .min(5, '问题至少5个字符')
    .max(500, '问题不能超过500个字符'),
  is_anonymous: z.boolean(),
});

export type QAQuestionFormData = z.infer<typeof qaQuestionSchema>;
