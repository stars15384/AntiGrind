import sqlite3
import json
import sys
from datetime import datetime

# 设置输出编码
sys.stdout.reconfigure(encoding='utf-8')

def query_database():
    conn = sqlite3.connect('antigrind.db')
    cursor = conn.cursor()

    print('=' * 60)
    print('[DATABASE] AntiGrind Test Database Report')
    print(f'[TIME] Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print('=' * 60)

    # 1. 表结构
    print('\n📋 数据库表结构:')
    print('-' * 40)
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    table_list = []
    for table in tables:
        table_name = table[0]
        table_list.append(table_name)
        cursor.execute(f'PRAGMA table_info({table_name})')
        columns = cursor.fetchall()
        col_names = [col[1] for col in columns]
        print(f'\n  ✅ {table_name} ({len(columns)} 列)')
        print(f'     字段: {", ".join(col_names[:5])}{"..." if len(col_names) > 5 else ""}')

    # 2. 用户数据
    print('\n\n👥 用户数据统计:')
    print('-' * 40)
    if 'users' in table_list:
        cursor.execute('SELECT COUNT(*) FROM users')
        total_users = cursor.fetchone()[0]
        print(f'  总用户数: {total_users}')

        cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = 1")
        active_users = cursor.fetchone()[0]
        print(f'  活跃用户: {active_users}')

        cursor.execute("SELECT role, COUNT(*) FROM users GROUP BY role")
        roles = cursor.fetchall()
        print('\n  角色分布:')
        for role, count in roles:
            print(f'    • {role}: {count} 人')

        # 前3个用户详情
        cursor.execute('''SELECT id, username, email, role, is_active,
                        created_at, last_active
                        FROM users LIMIT 3''')
        users = cursor.fetchall()
        print('\n  示例用户 (前3个):')
        for i, user in enumerate(users, 1):
            status = '✅ 活跃' if user[4] else '❌ 禁用'
            print(f'\n  {i}. {user[1]} ({user[2]})')
            print(f'     ID: {user[0][:12]}...')
            print(f'     角色: {user[3]} | 状态: {status}')
            print(f'     注册时间: {user[5][:19]}')
            print(f'     最后活跃: {user[6][:19] if user[6] else "从未"}')

    # 3. 公司数据
    print('\n\n🏢 公司数据统计:')
    print('-' * 40)
    if 'companies' in table_list:
        cursor.execute('SELECT COUNT(*) FROM companies')
        total_companies = cursor.fetchone()[0]
        print(f'  总公司数: {total_companies}')

        # 认证状态分布
        cursor.execute("""SELECT certification_status, COUNT(*)
                       FROM companies
                       GROUP BY certification_status""")
        cert_stats = cursor.fetchall()
        print('\n  认证状态分布:')
        for status, count in cert_stats:
            print(f'    • {status or "未认证"}: {count} 家')

        # AGI评分分布
        cursor.execute("""
            SELECT
                SUM(CASE WHEN agi_score <= 30 THEN 1 ELSE 0 END) as green,
                SUM(CASE WHEN agi_score > 30 AND agi_score <= 60 THEN 1 ELSE 0 END) as yellow,
                SUM(CASE WHEN agi_score > 60 THEN 1 ELSE 0 END) as red
            FROM companies
            WHERE agi_score IS NOT NULL
        """)
        agi_dist = cursor.fetchone()
        print(f'\n  AGI区域分布:')
        print(f'    🟢 绿色区域 (≤30): {agi_dist[0]} 家')
        print(f'    🟡 黄色区域 (31-60): {agi_dist[1]} 家')
        print(f'    🔴 红色区域 (>60): {agi_dist[2]} 家')

        # 前3个公司详情
        cursor.execute('''SELECT id, name, industry, agi_score,
                        certification_status, employee_count
                        FROM companies LIMIT 3''')
        companies = cursor.fetchall()
        print('\n  示例公司 (前3个):')
        for i, comp in enumerate(companies, 1):
            agi = comp[3] if comp[3] else 'N/A'
            cert_status = comp[4] or '未认证'
            print(f'\n  {i}. {comp[1]}')
            print(f'     ID: {comp[0][:12]}... | 行业: {comp[2]}')
            print(f'     AGI评分: {agi} | 认证状态: {cert_status}')
            print(f'     员工数: {comp[5] or 0} 人')

    # 4. 认证数据
    print('\n\n📜 认证申请统计:')
    print('-' * 40)
    if 'certifications' in table_list:
        cursor.execute('SELECT COUNT(*) FROM certifications')
        total_certs = cursor.fetchone()[0]
        print(f'  总认证申请: {total_certs}')

        cursor.execute("""SELECT status, COUNT(*)
                       FROM certifications
                       GROUP BY status""")
        status_stats = cursor.fetchall()
        print('\n  审核状态分布:')
        for status, count in status_stats:
            emoji = {'pending': '⏳', 'under_review': '🔍',
                    'approved': '✅', 'rejected': '❌'}.get(status, '📋')
            print(f'    {emoji} {status}: {count} 个')

        cursor.execute("""SELECT certification_level, COUNT(*)
                       FROM certifications
                       GROUP BY certification_level""")
        level_stats = cursor.fetchall()
        print('\n  等级分布:')
        for level, count in level_stats:
            print(f'    🏆 {level or "未定级"}: {count} 个')

    # 5. 工时记录（如果有）
    print('\n\n⏱️ 工时记录统计:')
    print('-' * 40)
    if 'work_hours' in table_list:
        cursor.execute('SELECT COUNT(*) FROM work_hours')
        total_hours = cursor.fetchone()[0]
        print(f'  总工时记录: {total_hours}')

        cursor.execute("""SELECT user_id, COUNT(*), AVG(hours_worked)
                       FROM work_hours
                       GROUP BY user_id
                       ORDER BY COUNT(*) DESC
                       LIMIT 3""")
        top_users = cursor.fetchall()
        if top_users:
            print('\n  最活跃的员工 (前3名):')
            for uid, count, avg_hours in top_users:
                cursor.execute(f'SELECT username FROM users WHERE id = "{uid}"')
                user = cursor.fetchone()
                name = user[0] if user else uid[:8]
                print(f'    • {name}: {count} 条记录, 平均工时 {avg_hours:.1f}小时/天')

    # 6. 数据一致性检查
    print('\n\n✅ 数据完整性检查:')
    print('-' * 40)

    # 检查外键关系
    if 'certifications' in table_list and 'companies' in table_list:
        cursor.execute("""
            SELECT COUNT(*) FROM certifications c
            LEFT JOIN companies co ON c.company_id = co.id
            WHERE co.id IS NULL
        """)
        orphan_certs = cursor.fetchone()[0]
        if orphan_certs > 0:
            print(f'  ⚠️ 孤立认证记录: {orphan_certs} 条 (公司不存在)')
        else:
            print('  ✅ 所有认证记录都有对应的公司')

    if 'work_hours' in table_list and 'users' in table_list:
        cursor.execute("""
            SELECT COUNT(*) FROM work_hours wh
            LEFT JOIN users u ON wh.user_id = u.id
            WHERE u.id IS NULL
        """)
        orphan_hours = cursor.fetchone()[0]
        if orphan_hours > 0:
            print(f'  ⚠️ 孤立工时记录: {orphan_hours} 条 (用户不存在)')
        else:
            print('  ✅ 所有工时记录都有对应的用户')

    print('\n' + '=' * 60)
    print('📊 数据库报告生成完成!')
    print('=' * 60)

    conn.close()

if __name__ == '__main__':
    query_database()