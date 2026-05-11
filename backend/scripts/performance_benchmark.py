"""
Performance Benchmark Script
用于测试API响应时间和生成性能报告
"""

import requests
import time
import statistics
from datetime import datetime
from typing import List, Dict, Tuple

BASE_URL = "http://localhost:8000"

class PerformanceBenchmark:
    """性能基准测试工具"""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.results: List[Dict] = []
    
    def measure_endpoint(self, method: str, endpoint: str, **kwargs) -> Dict:
        """
        测量单个端点的性能
        
        返回:
        {
            "endpoint": str,
            "method": str,
            "status_code": int,
            "response_time_ms": float,
            "success": bool,
            "timestamp": datetime
        }
        """
        url = f"{self.base_url}{endpoint}"
        
        start_time = time.time()
        try:
            if method.upper() == "GET":
                response = requests.get(url, params=kwargs.get('params'), timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=kwargs.get('json'), timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            elapsed_ms = (time.time() - start_time) * 1000
            
            result = {
                "endpoint": endpoint,
                "method": method,
                "status_code": response.status_code,
                "response_time_ms": round(elapsed_ms, 2),
                "success": 200 <= response.status_code < 300,
                "timestamp": datetime.utcnow().isoformat(),
            }
            
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            result = {
                "endpoint": endpoint,
                "method": method,
                "status_code": None,
                "response_time_ms": round(elapsed_ms, 2),
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            }
        
        self.results.append(result)
        return result
    
    def benchmark_endpoint(self, method: str, endpoint: str, iterations: int = 5, **kwargs) -> Dict:
        """
        对单个端点进行多次测量并统计
        
        Returns:
        {
            "endpoint": str,
            "iterations": int,
            "avg_ms": float,
            "min_ms": float,
            "max_ms": float,
            "p50_ms": float,
            "p95_ms": float,
            "p99_ms": float,
            "success_rate": float,
        }
        """
        times = []
        successes = 0
        
        for _ in range(iterations):
            result = self.measure_endpoint(method, endpoint, **kwargs)
            times.append(result["response_time_ms"])
            if result["success"]:
                successes += 1
        
        sorted_times = sorted(times)
        n = len(sorted_times)
        
        return {
            "endpoint": endpoint,
            "iterations": iterations,
            "avg_ms": round(statistics.mean(times), 2),
            "min_ms": round(min(times), 2),
            "max_ms": round(max(times), 2),
            "p50_ms": round(sorted_times[n // 2], 2) if n > 0 else 0,
            "p95_ms": round(sorted_times[int(n * 0.95)] if n > 1 else sorted_times[0], 2),
            "p99_ms": round(sorted_times[min(int(n * 0.99), n - 1)], 2) if n > 0 else 0,
            "success_rate": f"{(successes / iterations * 100):.1f}%",
        }
    
    def run_full_benchmark(self):
        """运行完整的性能基准测试套件"""
        print("="*70)
        print("AntiGrind API Performance Benchmark")
        print(f"Started at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
        print("="*70)
        print()
        
        test_cases = [
            # (method, endpoint, description, kwargs)
            ("GET", "/health", "Health Check", {}),
            ("GET", "/api/companies?limit=10", "Company List (10 items)", {"params": {"limit": 10}}),
            ("GET", "/api/rankings?limit=10", "Rankings (10 items)", {"params": {"limit": 10}}),
            ("GET", "/api/rankings/industries", "Industry Comparison", {}),
        ]
        
        all_stats = []
        
        for method, endpoint, desc, kwargs in test_cases:
            print(f"Testing: {desc}")
            print(f"Endpoint: {method} {endpoint}")
            
            stats = self.benchmark_endpoint(method, endpoint, iterations=3, **kwargs)
            all_stats.append(stats)
            
            # 输出结果
            status_icon = "[OK]" if stats["success_rate"] == "100.0%" else "[WARN]"
            print(f"{status_icon} Avg: {stats['avg_ms']:>8.2f}ms | "
                  f"P50: {stats['p50_ms']:>7.2f}ms | "
                  f"P95: {stats['p95_ms']:>7.2f}ms | "
                  f"Success: {stats['success_rate']}")
            print()
        
        # 生成汇总报告
        self._print_summary(all_stats)
        
        return all_stats
    
    def _print_summary(self, all_stats: List[Dict]):
        """打印性能摘要报告"""
        print("="*70)
        print("PERFORMANCE SUMMARY")
        print("="*70)
        
        slow_endpoints = [s for s in all_stats if s["avg_ms"] > 500]
        fast_endpoints = [s for s in all_stats if s["avg_ms"] <= 200]
        
        print(f"\nTotal endpoints tested: {len(all_stats)}")
        print(f"Fast (< 200ms):       {len(fast_endpoints)}")
        print(f"Normal (200-500ms):   {len(all_stats) - len(slow_endpoints) - len(fast_endpoints)}")
        print(f"Slow (> 500ms):       {len(slow_endpoints)}")
        
        if slow_endpoints:
            print("\n[!] SLOW ENDPOINTS (need optimization):")
            for stat in slow_endpoints:
                print(f"  - {stat['endpoint']}: avg {stat['avg_ms']}ms")
        
        overall_avg = statistics.mean([s["avg_ms"] for s in all_stats])
        print(f"\n[STAT] Overall average response time: {overall_avg:.2f}ms")
        
        if overall_avg < 200:
            print("[EXCELLENT] All APIs performing well!")
        elif overall_avg < 500:
            print("[GOOD] Most APIs within acceptable range")
        else:
            print("[WARNING] Some APIs need optimization")
        
        print("\n" + "="*70)


def main():
    """主函数：运行性能基准测试"""
    try:
        benchmark = PerformanceBenchmark()
        results = benchmark.run_full_benchmark()
        
        # 保存结果到文件（可选）
        output_file = f"performance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(output_file, 'w') as f:
            f.write(f"Performance Report - {datetime.utcnow()}\n\n")
            for stat in results:
                f.write(f"{stat['endpoint']}: {stat['avg_ms']}ms (P95: {stat['p95_ms']}ms)\n")
        
        print(f"\n[REPORT] Detailed report saved to: {output_file}")
        
    except Exception as e:
        print(f"\n[ERROR] Error running benchmark: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
