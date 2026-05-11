import requests
import json

base_url = 'http://localhost:8000'

print('=== Testing New API Endpoints ===')
print()

# Test 1: Rankings API
print('1. Testing /api/rankings...')
try:
    r = requests.get(f'{base_url}/api/rankings?limit=5')
    print(f'   Status: {r.status_code}')
    if r.status_code == 200:
        data = r.json()
        print(f'   Keys: {list(data.keys())}')
        pagination = data.get('pagination', {})
        print(f'   Total companies: {pagination.get("total_count", 0)}')
        stats = data.get('statistics', {})
        print(f'   Statistics: {stats}')
except Exception as e:
    print(f'   Error: {e}')
print()

# Test 2: Admin Dashboard (should fail without auth)
print('2. Testing /api/admin/dashboard/stats (no auth)...')
try:
    r = requests.get(f'{base_url}/api/admin/dashboard/stats')
    print(f'   Status: {r.status_code} (expected: 401 or 403)')
except Exception as e:
    print(f'   Error: {e}')
print()

# Test 3: Industry comparison
print('3. Testing /api/rankings/industries...')
try:
    r = requests.get(f'{base_url}/api/rankings/industries')
    print(f'   Status: {r.status_code}')
    if r.status_code == 200:
        data = r.json()
        print(f'   Industries count: {data.get("total_industries", 0)}')
except Exception as e:
    print(f'   Error: {e}')
print()

# Test 4: Companies list (to check basic functionality)
print('4. Testing /api/companies...')
try:
    r = requests.get(f'{base_url}/api/companies?limit=5')
    print(f'   Status: {r.status_code}')
    if r.status_code == 200:
        data = r.json()
        if isinstance(data, list):
            print(f'   Companies returned: {len(data)}')
        elif isinstance(data, dict):
            print(f'   Response keys: {list(data.keys())[:5]}')
except Exception as e:
    print(f'   Error: {e}')
print()

print('=== API Tests Complete ===')
