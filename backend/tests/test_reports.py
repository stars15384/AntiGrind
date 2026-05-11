"""
Tests for PDF Report Generation Service
覆盖: report_service.py
"""

import pytest

from app.services.report_service import PDFReportGenerator


class TestPDFReportGenerator:
    """PDF报告生成器测试套件"""

    def setup_method(self):
        """每个测试方法前的初始化"""
        self.generator = PDFReportGenerator()

    def _get_sample_data(self):
        """生成标准测试数据"""
        return {
            "company_info": {
                "name": "Test Corporation",
                "industry": "Technology",
                "location": "Beijing",
            },
            "agi_data": {
                "total_score": 25.5,
                "level": "green",
                "dimensions": {
                    "hours_score": {"value": 10, "weight": 0.4},
                    "weekend_score": {"value": 8, "weight": 0.25},
                    "overtime_score": {"value": 4, "weight": 0.15},
                    "shift_score": {"value": 2, "weight": 0.1},
                    "vibe_score": {"value": 6, "weight": 0.1},
                },
            },
            "work_hours_stats": {
                "avg_weekly_hours": 42,
                "weekend_policy_distribution": {
                    "double_rest": 30,
                    "big_small_week": 10,
                    "single_rest": 8,
                    "no_rest": 2,
                },
                "overtime_compensation_distribution": {
                    "legal": 35,
                    "fixed_subsidy": 12,
                    "unpaid": 3,
                },
            },
            "certification_info": {
                "level": "gold",
                "issue_date": "2026-04-21",
                "expiry_date": "2027-04-21",
                "badge_code": "AGI-GOLD-TEST001",
            },
        }

    # ========== 基础功能测试 ==========

    def test_generate_basic_report(self):
        """测试基本报告生成功能"""
        data = self._get_sample_data()

        pdf_bytes = self.generator.generate_certification_report(
            company_info=data["company_info"],
            agi_data=data["agi_data"],
            work_hours_stats=data["work_hours_stats"],
            certification_info=data["certification_info"],
        )

        # 验证返回值类型和基本属性
        assert isinstance(pdf_bytes, bytes), "应该返回bytes类型"
        assert len(pdf_bytes) > 0, "PDF内容不应为空"
        assert len(pdf_bytes) > 1000, "PDF文件大小应大于1KB"

        # 验证PDF文件头
        assert pdf_bytes[:5] == b"%PDF-", "应以PDF魔术数字开头"

    def test_generate_report_with_recommendations(self):
        """测试带改进建议的报告生成"""
        data = self._get_sample_data()
        recommendations = [
            "建议优化周末休息制度",
            "加班补偿可进一步规范化",
        ]

        pdf_bytes = self.generator.generate_certification_report(
            company_info=data["company_info"],
            agi_data=data["agi_data"],
            work_hours_stats=data["work_hours_stats"],
            certification_info=data["certification_info"],
            recommendations=recommendations,
        )

        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 0

    def test_generate_report_without_recommendations(self):
        """测试无建议时的报告生成（recommendations=None）"""
        data = self._get_sample_data()

        pdf_bytes = self.generator.generate_certification_report(
            company_info=data["company_info"],
            agi_data=data["agi_data"],
            work_hours_stats=data["work_hours_stats"],
            certification_info=data["certification_info"],
            recommendations=None,
        )

        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 0

    # ========== 语言切换测试 ==========

    def test_chinese_language_default(self):
        """测试中文版本（默认）"""
        data = self._get_sample_data()

        pdf_bytes = self.generator.generate_certification_report(
            company_info=data["company_info"],
            agi_data=data["agi_data"],
            work_hours_stats=data["work_hours_stats"],
            certification_info=data["certification_info"],
            language="zh",
        )

        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 0

    def test_english_language(self):
        """测试英文版本"""
        data = self._get_sample_data()

        pdf_bytes = self.generator.generate_certification_report(
            company_info=data["company_info"],
            agi_data=data["agi_data"],
            work_hours_stats=data["work_hours_stats"],
            certification_info=data["certification_info"],
            language="en",
        )

        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 0

    # ========== AGI等级颜色编码测试 ==========

    def test_green_level_color(self):
        """测试绿色等级(AGI <= 30)的颜色编码"""
        data = self._get_sample_data()
        data["agi_data"]["total_score"] = 18.5
        data["agi_data"]["level"] = "green"

        pdf_bytes = self.generator.generate_certification_report(
            company_info=data["company_info"],
            agi_data=data["agi_data"],
            work_hours_stats=data["work_hours_stats"],
            certification_info=data["certification_info"],
        )

        assert isinstance(pdf_bytes, bytes)

    def test_yellow_level_color(self):
        """测试黄色等级(31 < AGI <= 60)的颜色编码"""
        data = self._get_sample_data()
        data["agi_data"]["total_score"] = 45.8
        data["agi_data"]["level"] = "yellow"

        pdf_bytes = self.generator.generate_certification_report(
            company_info=data["company_info"],
            agi_data=data["agi_data"],
            work_hours_stats=data["work_hours_stats"],
            certification_info=data["certification_info"],
        )

        assert isinstance(pdf_bytes, bytes)

    def test_red_level_color(self):
        """测试红色等级(AGI > 60)的颜色编码"""
        data = self._get_sample_data()
        data["agi_data"]["total_score"] = 72.3
        data["agi_data"]["level"] = "red"

        pdf_bytes = self.generator.generate_certification_report(
            company_info=data["company_info"],
            agi_data=data["agi_data"],
            work_hours_stats=data["work_hours_stats"],
            certification_info=data["certification_info"],
        )

        assert isinstance(pdf_bytes, bytes)

    # ========== 边界情况测试 ==========

    def test_empty_dimensions(self):
        """测试空维度数据的情况"""
        data = self._get_sample_data()
        data["agi_data"]["dimensions"] = {}

        pdf_bytes = self.generator.generate_certification_report(
            company_info=data["company_info"],
            agi_data=data["agi_data"],
            work_hours_stats=data["work_hours_stats"],
            certification_info=data["certification_info"],
        )

        assert isinstance(pdf_bytes, bytes)

    def test_zero_work_hours(self):
        """测试零工时记录的情况"""
        data = self._get_sample_data()
        data["work_hours_stats"]["avg_weekly_hours"] = 0
        data["work_hours_stats"]["weekend_policy_distribution"] = {}
        data["work_hours_stats"]["overtime_compensation_distribution"] = {}

        pdf_bytes = self.generator.generate_certification_report(
            company_info=data["company_info"],
            agi_data=data["agi_data"],
            work_hours_stats=data["work_hours_stats"],
            certification_info=data["certification_info"],
        )

        assert isinstance(pdf_bytes, bytes)

    def test_missing_optional_fields(self):
        """测试缺少可选字段的情况"""
        minimal_company_info = {"name": "Minimal Corp"}
        minimal_agi_data = {"total_score": 30.0, "level": "green", "dimensions": {}}
        minimal_work_hours = {"avg_weekly_hours": 40}
        minimal_cert_info = {"level": "bronze"}

        pdf_bytes = self.generator.generate_certification_report(
            company_info=minimal_company_info,
            agi_data=minimal_agi_data,
            work_hours_stats=minimal_work_hours,
            certification_info=minimal_cert_info,
        )

        assert isinstance(pdf_bytes, bytes)

    # ========== 性能测试 ==========

    def test_generation_performance(self):
        """测试PDF生成性能（应在2秒内完成）"""
        import time

        data = self._get_sample_data()

        start_time = time.time()

        for _ in range(3):  # 连续生成3次
            self.generator.generate_certification_report(
                company_info=data["company_info"],
                agi_data=data["agi_data"],
                work_hours_stats=data["work_hours_stats"],
                certification_info=data["certification_info"],
            )

        elapsed_time = time.time() - start_time

        # 平均每次生成时间应小于2秒
        avg_time = elapsed_time / 3
        assert avg_time < 2.0, f"平均生成时间 {avg_time:.2f}s 超过2秒限制"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
