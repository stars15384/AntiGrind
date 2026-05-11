import sys

import requests

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://localhost:8001"


def test_api_endpoint(method, endpoint, data=None, headers=None):
    """测试API端点"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            # 如果是登录接口，使用表单数据
            if "/auth/login" in endpoint and data:
                response = requests.post(url, data=data, headers=headers, timeout=5)
            else:
                response = requests.post(url, json=data, headers=headers, timeout=5)
        else:
            return None, "Unsupported method"

        return response.status_code, response.json()
    except requests.exceptions.ConnectionError:
        return None, "Connection failed - Backend not running"
    except Exception as e:
        return None, str(e)


def print_section(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def main():
    print("\n" + "#" * 70)
    print("#  AntiGrind 前后端联动测试报告")
    print("#" * 70)

    # 1. 测试后端是否运行
    print_section("1. 后端服务状态检查")
    status, _ = test_api_endpoint("GET", "/health")
    if status == 200:
        print("[OK] 后端服务正常运行 (http://localhost:8000)")
    else:
        print("[FAIL] 后端服务未启动或无法访问")
        return

    # 2. 用户端 - 公开API测试
    print_section("2. 用户端 API 测试 (公开接口)")

    # 2.1 获取公司列表
    print("\n[TEST] GET /api/companies - 公司列表")
    status, data = test_api_endpoint("GET", "/api/companies?limit=3")
    companies = []
    if status == 200 and "items" in data:
        companies = data["items"]
        print(f"[OK] 成功获取 {len(companies)} 个公司")
        for i, comp in enumerate(companies[:2], 1):
            print(f"  {i}. {comp.get('name', 'N/A')} (ID: {comp.get('id', 'N/A')[:12]}...)")
            print(f"     行业: {comp.get('industry', 'N/A')}")
            print(f"     AGI评分: {comp.get('agi_score', 'N/A')}")
    else:
        print(f"[FAIL] 状态码: {status} | 响应: {data}")

    # 2.2 获取单个公司详情
    if status == 200 and len(companies) > 0:
        company_id = companies[0]["id"]
        print(f"\n[TEST] GET /api/companies/{company_id} - 公司详情")
        status, detail = test_api_endpoint("GET", f"/api/companies/{company_id}")
        if status == 200:
            print("[OK] 成功获取公司详情")
            print(f"  名称: {detail.get('name', 'N/A')}")
            print(f"  认证状态: {detail.get('certification_status', 'N/A')}")
            print(f"  员工数: {detail.get('employee_count', 0)}")
        else:
            print(f"[FAIL] 状态码: {status}")

    # 2.3 获取排行榜
    print("\n[TEST] GET /api/rankings - 企业AGI排行榜")
    status, rankings = test_api_endpoint("GET", "/api/rankings?limit=5")
    if status == 200 and "rankings" in rankings:
        print(f"[OK] 成功获取排行榜 (共 {rankings.get('total', 0)} 家企业)")
        for i, r in enumerate(rankings["rankings"][:3], 1):
            print(f"  {i}. {r.get('name', 'N/A')} - AGI: {r.get('agi_score', 'N/A')}")
    else:
        print(f"[FAIL] 状态码: {status} | 数据: {rankings}")

    # 3. 管理员端 - 需要认证的API测试
    print_section("3. 管理员端 API 测试 (需要认证)")

    # 3.1 登录获取token
    print("\n[TEST] POST /api/auth/login - 管理员登录")
    login_data = {"username": "admin", "password": "admin123"}
    status, auth_data = test_api_endpoint(
        "POST", "/api/auth/login", data=login_data
    )  # 使用表单数据
    token = None
    if status == 200 and "access_token" in auth_data:
        token = auth_data["access_token"]
        print("[OK] 管理员登录成功")
        print(f"  Token: {token[:30]}...")
        auth_headers = {"Authorization": f"Bearer {token}"}
    else:
        print(f"[FAIL] 登录失败 | 状态码: {status}")
        print(f"  响应: {auth_data}")
        auth_headers = {}

    # 3.2 管理员仪表板
    print("\n[TEST] GET /api/admin/dashboard - 管理员仪表板")
    if token:
        status, dashboard = test_api_endpoint("GET", "/api/admin/dashboard", headers=auth_headers)
        if status == 200:
            print("[OK] 成功获取仪表板数据")
            if "users" in dashboard:
                print(f"  总用户数: {dashboard['users'].get('total', 0)}")
                print(f"  活跃用户: {dashboard['users'].get('active_7d', 0)}")
            if "companies" in dashboard:
                print(f"  总公司数: {dashboard['companies'].get('total', 0)}")
                print(f"  已认证: {dashboard['companies'].get('certified', 0)}")
            if "certifications" in dashboard:
                print(f"  待审核: {dashboard['certifications'].get('pending_review', 0)}")
        else:
            print(f"[FAIL] 状态码: {status}")
    else:
        print("[SKIP] 无有效Token，跳过")

    # 3.3 用户管理列表
    print("\n[TEST] GET /api/admin/users - 用户列表")
    if token:
        status, users_data = test_api_endpoint(
            "GET", "/api/admin/users?limit=3", headers=auth_headers
        )
        if status == 200 and "users" in users_data:
            users_list = users_data["users"]
            print(
                f"[OK] 成功获取 {len(users_list)} 个用户 "
                f"(总计: {users_data.get('pagination', {}).get('total', 0)})"
            )
            for i, user in enumerate(users_list[:2], 1):
                print(f"  {i}. {user.get('username', 'N/A')} ({user.get('email', 'N/A')})")
                print(
                    f"     角色: {user.get('role', 'N/A')} | "
                    f"状态: {'活跃' if user.get('is_active') else '禁用'}"
                )
        else:
            print(f"[FAIL] 状态码: {status} | 数据: {users_data}")
    else:
        print("[SKIP] 无有效Token，跳过")

    # 3.4 公司管理列表
    print("\n[TEST] GET /api/admin/companies - 公司列表")
    if token:
        status, comp_data = test_api_endpoint(
            "GET", "/api/admin/companies?limit=3", headers=auth_headers
        )
        if status == 200 and isinstance(comp_data, list):
            print(f"[OK] 成功获取 {len(comp_data)} 个公司")
            for i, comp in enumerate(comp_data[:2], 1):
                print(f"  {i}. {comp.get('name', 'N/A')}")
                print(
                    f"     AGI: {comp.get('agi_score', 'N/A')} | "
                    f"认证: {comp.get('certification_status', 'N/A')}"
                )
        elif status == 200 and "companies" in comp_data:
            admin_comps = comp_data["companies"]
            print(f"[OK] 成功获取 {len(admin_comps)} 个公司")
        else:
            print(f"[FAIL] 状态码: {status}")
    else:
        print("[SKIP] 无有效Token，跳过")

    # 4. 数据一致性验证
    print_section("4. 数据一致性验证")

    if token:
        print("\n[VERIFY] 对比用户端与管理员端的公司数据...")

        # 从用户端获取
        _, user_companies = test_api_endpoint("GET", "/api/companies?limit=10")
        user_company_ids = (
            set([c["id"] for c in user_companies.get("items", [])])
            if "items" in user_companies
            else set()
        )

        # 从管理员端获取
        _, admin_companies = test_api_endpoint(
            "GET", "/api/admin/companies?limit=10", headers=auth_headers
        )
        admin_company_ids = (
            set([c["id"] for c in admin_companies]) if isinstance(admin_companies, list) else set()
        )

        if user_company_ids and admin_company_ids:
            common = user_company_ids & admin_company_ids
            print(f"[OK] 用户端可见公司: {len(user_company_ids)} 家")
            print(f"[OK] 管理员端可见公司: {len(admin_company_ids)} 家")
            print(f"[OK] 两端共有公司: {len(common)} 家")

            if common:
                # 检查具体数据是否一致
                sample_id = list(common)[0]
                _, user_detail = test_api_endpoint("GET", f"/api/companies/{sample_id}")
                _, admin_detail = test_api_endpoint(
                    "GET", f"/api/admin/companies/{sample_id}", headers=auth_headers
                )

                checks = []
                if user_detail.get("name") == admin_detail.get("name"):
                    checks.append(("公司名称", "一致"))
                if user_detail.get("agi_score") == admin_detail.get("agi_score"):
                    checks.append(("AGI评分", "一致"))
                if user_detail.get("industry") == admin_detail.get("industry"):
                    checks.append(("行业", "一致"))

                print(f"\n[DETAIL] 样本公司数据对比 (ID: {sample_id[:12]}...):")
                for field, result in checks:
                    print(f"  {field}: {result}")

                if len(checks) == 3:
                    print("\n[PASS] 数据完全一致!")
                else:
                    print(f"\n[WARN] {3 - len(checks)} 项数据不一致")
        else:
            print("[WARN] 无法进行对比 - 数据为空")
    else:
        print("[SKIP] 无管理员权限，无法验证")

    # 5. 总结
    print_section("5. 测试总结")
    print("""
  [STATUS] 前后端联动测试完成
  [NOTE]   请查看上方详细结果
  [NEXT]   如需进一步测试，请检查前端页面展示
""")


if __name__ == "__main__":
    main()
