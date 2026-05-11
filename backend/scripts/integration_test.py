"""
Complete API Integration Test Suite
测试所有新增功能的API端点
"""

import time

import requests

BASE_URL = "http://localhost:8000"


class APITester:
    def __init__(self):
        self.results = []
        self.token = None

    def test_endpoint(self, method, endpoint, expected_status=None, **kwargs):
        """测试单个API端点"""
        url = f"{BASE_URL}{endpoint}"
        start_time = time.time()

        try:
            if method.upper() == "GET":
                response = requests.get(url, **kwargs)
            elif method.upper() == "POST":
                response = requests.post(url, **kwargs)
            else:
                return {"error": f"Unsupported method: {method}"}

            elapsed_ms = (time.time() - start_time) * 1000

            result = {
                "endpoint": endpoint,
                "method": method,
                "status_code": response.status_code,
                "response_time_ms": round(elapsed_ms, 2),
                "success": response.status_code < 400,
                "data": response.json()
                if response.headers.get("content-type", "").startswith("application/json")
                else None,
            }

            # 验证状态码
            if expected_status and response.status_code != expected_status:
                result["warning"] = f"Expected {expected_status}, got {response.status_code}"

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            result = {
                "endpoint": endpoint,
                "method": method,
                "status_code": None,
                "response_time_ms": round(elapsed_ms, 2),
                "success": False,
                "error": str(e),
            }

        self.results.append(result)
        return result

    def print_result(self, result):
        """格式化打印结果"""
        icon = "[OK]" if result["success"] else "[FAIL]"
        time_val = result.get("response_time_ms", "N/A")
        if isinstance(time_val, (int, float)):
            time_str = f"{time_val:.0f}ms"
        else:
            time_str = str(time_val)
        status = f"{result.get('status_code', 'N/A')}"

        extra = ""
        if "error" in result:
            extra = f" - Error: {result['error'][:50]}"
        elif "warning" in result:
            extra = f" - {result['warning'][:50]}"

        print(
            f"  {icon} {result['method']:4s} {result['endpoint']:<45s} | Status: {status:>3s} | Time: {time_str:>6s}{extra}"
        )

    def login_as_admin(self):
        """使用admin账号登录获取token"""
        print("\n[LOGIN] Attempting admin login...")

        # OAuth2PasswordRequestForm 使用 form data 格式
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={
                "username": "admin",
                "password": "Admin123!",
            },
        )

        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            print(f"[OK] Admin login successful! Token obtained: {self.token[:20]}...")
            return True
        else:
            print(f"[FAIL] Admin login failed (Status {response.status_code}):")
            try:
                error_data = response.json()
                print(f"       Error: {error_data.get('detail', 'Unknown')}")
            except:
                print(f"       Response: {response.text[:100]}")
            return False


def run_all_tests():
    """运行所有API集成测试"""

    print("=" * 80)
    print(" ANTI-GRIND API INTEGRATION TEST SUITE")
    print(f" Base URL: {BASE_URL}")
    print(
        f" Started at: {__import__('datetime').datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC"
    )
    print("=" * 80)

    tester = APITester()

    # ========== 基础健康检查 ==========
    print("\n[1/7] BASIC HEALTH CHECKS")
    print("-" * 60)

    tester.test_endpoint("GET", "/health", 200)
    tester.print_result(tester.results[-1])

    # ========== 核心API可用性检查 ==========
    print("\n[2/7] CORE API AVAILABILITY (Unauthenticated)")
    print("-" * 60)

    # 企业列表
    r = tester.test_endpoint("GET", "/api/companies?limit=5", 200)
    tester.print_result(r)

    # 排行榜
    r = tester.test_endpoint("GET", "/api/rankings?limit=10", 200)
    tester.print_result(r)

    # 行业对比
    r = tester.test_endpoint("GET", "/api/rankings/industries", 200)
    tester.print_result(r)

    # TOP企业
    r = tester.test_endpoint("GET", "/api/rankings/top?limit=5", 200)
    tester.print_result(r)

    # Admin权限验证（应返回401）
    r = tester.test_endpoint("GET", "/api/admin/dashboard/stats", 401)
    tester.print_result(r)

    # 认证列表（需认证，应返回401）
    r = tester.test_endpoint("GET", "/api/certifications/my/badges", 401)
    tester.print_result(r)

    # ========== 登录认证 ==========
    print("\n[3/7] AUTHENTICATION")
    print("-" * 60)

    login_success = tester.login_as_admin()

    if not login_success:
        print("[WARN] Skipping authenticated tests - login failed")
        return tester.results

    headers = {"Authorization": f"Bearer {tester.token}"}

    # ========== 已认证API测试 ==========
    print("\n[4/7] AUTHENTICATED API TESTS")
    print("-" * 60)

    # Admin仪表盘统计
    r = requests.get(f"{BASE_URL}/api/admin/dashboard/stats", headers=headers)
    result = {
        "endpoint": "/api/admin/dashboard/stats",
        "method": "GET",
        "status_code": r.status_code,
        "response_time_ms": "N/A",
        "success": r.status_code == 200,
        "has_data": len(r.json()) > 0
        if r.headers.get("content-type", "").startswith("application/json")
        else False,
    }
    tester.results.append(result)
    tester.print_result(result)

    if result["success"]:
        data = r.json()
        print(f"       Users: {data.get('users', {}).get('total', 'N/A')}")
        print(f"       Companies: {data.get('companies', {}).get('total', 'N/A')}")
        print(
            f"       Pending Certifications: {data.get('certifications', {}).get('pending_review', 'N/A')}"
        )

    # 待审核认证列表
    r = requests.get(f"{BASE_URL}/api/admin/certifications/pending?limit=20", headers=headers)
    result = {
        "endpoint": "/api/admin/certifications/pending",
        "method": "GET",
        "status_code": r.status_code,
        "response_time_ms": "N/A",
        "success": r.status_code == 200,
        "pending_count": len(r.json().get("certifications", [])) if r.status_code == 200 else 0,
    }
    tester.results.append(result)
    tester.print_result(result)

    # 用户列表
    r = requests.get(f"{BASE_URL}/api/admin/users?limit=10", headers=headers)
    result = {
        "endpoint": "/api/admin/users",
        "method": "GET",
        "status_code": r.status_code,
        "response_time_ms": "N/A",
        "success": r.status_code == 200,
        "user_count": len(r.json().get("users", [])) if r.status_code == 200 else 0,
    }
    tester.results.append(result)
    tester.print_result(result)

    # 我的徽章
    r = requests.get(f"{BASE_URL}/api/certifications/my/badges", headers=headers)
    result = {
        "endpoint": "/api/certifications/my/badges",
        "method": "GET",
        "status_code": r.status_code,
        "response_time_ms": "N/A",
        "success": r.status_code == 200,
        "badge_count": len(r.json()) if r.status_code == 200 else 0,
    }
    tester.results.append(result)
    tester.print_result(result)

    # ========== 排行榜功能验证 ==========
    print("\n[5/7] RANKINGS FUNCTIONALITY VERIFICATION")
    print("-" * 60)

    # 带筛选的排行榜
    r = requests.get(
        f"{BASE_URL}/api/rankings?industry=tech&sort_by=agi_score&sort_order=asc&limit=5",
        headers=headers,
    )
    result = {
        "endpoint": "/api/rankings?industry=tech",
        "method": "GET",
        "status_code": r.status_code,
        "response_time_ms": "N/A",
        "success": r.status_code == 200,
        "has_filters": True,
    }
    tester.results.append(result)
    tester.print_result(result)

    if result["success"]:
        data = r.json()
        stats = data.get("statistics", {})
        print(f"       Total certified: {stats.get('total_certified', 'N/A')}")
        print(f"       Green zone: {stats.get('green_companies', 'N/A')}")
        print(f"       Yellow zone: {stats.get('yellow_companies', 'N/A')}")
        print(f"       Red zone: {stats.get('red_companies', 'N/A')}")
        print(f"       Avg AGI score: {stats.get('avg_agi_score', 'N/A')}")

    # ========== PDF报告生成测试（需要已认证的企业）==========
    print("\n[6/7] PDF REPORT GENERATION TEST")
    print("-" * 60)

    # 先获取一个已通过认证的ID
    cert_id_to_test = None
    try:
        # 查找approved状态的认证
        import sqlite3

        conn = sqlite3.connect("antigrind.db")
        cursor = conn.execute("SELECT id FROM certifications WHERE status='approved' LIMIT 1")
        row = cursor.fetchone()
        if row:
            cert_id_to_test = row[0]
            print(f"[INFO] Found certification ID for test: {cert_id_to_test[:8]}...")
        conn.close()
    except Exception as e:
        print(f"[WARN] Could not query DB for cert ID: {e}")

    if cert_id_to_test and tester.token:
        r = requests.get(
            f"{BASE_URL}/api/certifications/{cert_id_to_test}/report?language=zh", headers=headers
        )
        result = {
            "endpoint": "/api/certifications/{id}/report",
            "method": "GET",
            "status_code": r.status_code,
            "response_time_ms": "N/A",
            "success": r.status_code == 200,
            "is_pdf": r.headers.get("content-type") == "application/pdf",
            "size_bytes": len(r.content) if r.status_code == 200 else 0,
        }
        tester.results.append(result)
        tester.print_result(result)

        if result["success"] and result["is_pdf"]:
            size_kb = result["size_bytes"] / 1024
            print(f"       PDF generated successfully! Size: {size_kb:.2f} KB")
    else:
        print("  [SKIP] No approved certification found or no token - skipping PDF test")

    # ========== 性能基准测试 ==========
    print("\n[7/7] PERFORMANCE BENCHMARK")
    print("-" * 60)

    endpoints_to_benchmark = [
        ("GET", "/health"),
        ("GET", "/api/companies?limit=10"),
        ("GET", "/api/rankings?limit=10"),
        ("GET", "/api/rankings/industries"),
        ("GET", "/api/admin/dashboard/stats"),
    ]

    perf_results = []
    for method, endpoint in endpoints_to_benchmark:
        kwargs = {}
        if "admin" in endpoint:
            kwargs = {"headers": headers}

        r = tester.test_endpoint(method, endpoint, **kwargs)
        perf_results.append(r["response_time_ms"])
        print(f"  {r['response_time_ms']:>8.2f}ms  {method:4s} {endpoint}")

    if perf_results:
        avg_time = sum(perf_results) / len(perf_results)
        max_time = max(perf_results)
        min_time = min(perf_results)
        print(f"\n  Average: {avg_time:.2f}ms | Min: {min_time:.2f}ms | Max: {max_time:.2f}ms")

    # ========== 最终报告 ==========
    print("\n" + "=" * 80)
    print(" TEST SUMMARY")
    print("=" * 80)

    total_tests = len(tester.results)
    passed_tests = sum(1 for r in tester.results if r["success"])
    failed_tests = total_tests - passed_tests

    print(f"\n Total tests run:     {total_tests}")
    print(f" Passed:             {passed_tests} ({passed_tests / total_tests * 100:.1f}%)")
    print(f" Failed:             {failed_tests} ({failed_tests / total_tests * 100:.1f}%)")

    if failed_tests > 0:
        print("\n [!] FAILED TESTS:")
        for i, r in enumerate(tester.results):
            if not r["success"]:
                error_msg = r.get("error", r.get("warning", "Unknown"))
                print(f"   {i + 1}. {r['method']} {r['endpoint']} - {error_msg}")
    else:
        print("\n [SUCCESS] All API tests passed!")

    success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0

    if success_rate >= 90:
        status_icon = "[EXCELLENT]"
    elif success_rate >= 70:
        status_icon = "[GOOD]"
    else:
        status_icon = "[NEEDS WORK]"

    print(f"\n Overall Status: {status_icon} ({success_rate:.1f}% pass rate)")
    print("=" * 80)

    return tester.results


if __name__ == "__main__":
    results = run_all_tests()
    exit(0 if all(r["success"] for r in results) else 1)
