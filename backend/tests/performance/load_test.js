import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

// 自定义指标
const errorRate = new Rate('errors')
const requestDuration = new Trend('request_duration')

export const options = {
  stages: [
    { duration: '10s', target: 5 },    // 预热
    { duration: '20s', target: 20 },   // 正常负载
    { duration: '15s', target: 50 },   // 高负载
    { duration: '10s', target: 0 },    // 恢复
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95%请求<500ms
    errors: ['rate<0.05'],             // 错误率<5%
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000'

export default function () {
  // 1. 健康检查
  let res = http.get(`${BASE_URL}/health`)
  check(res, {
    'health check status is 200': (r) => r.status === 200,
  })
  errorRate.add(res.status !== 200)
  requestDuration.add(res.timings.duration)

  sleep(0.5)

  // 2. 用户注册（带唯一用户名）
  const randomUser = `loadtest_${__VU}_${Date.now()}`
  res = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    username: randomUser,
    email: `${randomUser}@test.com`,
    password: 'TestPass123!'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })

  check(res, {
    'registration successful': (r) => [200, 201].includes(r.status),
  })

  errorRate.add(res.status !== 200 && res.status !== 201)
  requestDuration.add(res.timings.duration)

  sleep(1)

  // 3. 登录获取token
  res = http.post(`${BASE_URL}/api/auth/login`,
    `username=${randomUser}&password=TestPass123!`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  const loginSuccess = check(res, {
    'login successful': (r) => r.status === 200,
    'returned token': (r) => r.json().access_token !== undefined,
  })

  if (!loginSuccess) {
    console.log('Login failed, skipping profile test')
    return
  }

  const token = res.json().access_token

  sleep(0.5)

  // 4. 访问受保护资源（个人资料）
  res = http.get(`${BASE_URL}/api/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  check(res, {
    'profile access OK': (r) => r.status === 200,
  })

  errorRate.add(res.status !== 200)
  requestDuration.add(res.timings.duration)

  sleep(1)

  // 5. 列出企业（公开接口）
  res = http.get(`${BASE_URL}/api/companies?limit=10`)

  check(res, {
    'company list accessible': (r) => [200, 404].includes(r.status),
  })

  requestDuration.add(res.timings.duration)
}
