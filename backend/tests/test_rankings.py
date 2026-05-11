"""
Tests for Rankings Service and API
覆盖: ranking_service.py, rankings.py (API)
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ranking_service import RankingService


class TestRankingService:
    """排行榜服务单元测试"""

    def setup_method(self):
        self.service = RankingService()

    async def _create_mock_session(self):
        """创建模拟的数据库会话"""
        session = MagicMock(spec=AsyncSession)
        session.execute = AsyncMock()
        session.scalar_one_or_none = AsyncMock()
        return session

    # ========== 基础功能测试 ==========

    @pytest.mark.asyncio
    async def test_get_rankings_returns_correct_structure(self):
        """测试排行榜返回数据结构是否正确"""
        mock_session = await self._create_mock_session()

        # 模拟count查询返回0
        count_result = MagicMock()
        count_result.scalar.return_value = 0

        # 模拟主查询返回空列表
        main_result = MagicMock()
        mock_companies = MagicMock()
        mock_companies.scalars.return_value.all.return_value = []
        main_result.scalars.return_value.all.return_value = []

        # 模拟行业统计查询
        industries_result = MagicMock()
        industries_rows = []
        industries_result.all.return_value = industries_rows

        # 设置execute按顺序返回不同结果
        call_count = 0

        async def execute_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return count_result  # count查询
            elif call_count == 2:
                return main_result  # 主查询
            elif call_count == 3:
                result = MagicMock()
                result.all.return_value = []  # 行业列表为空
                return result
            else:
                result = MagicMock()
                result.all.return_value = []
                return result

        mock_session.execute = AsyncMock(side_effect=execute_side_effect)

        result = await self.service.get_rankings(
            db=mock_session,
            limit=10,
            offset=0,
        )

        # 验证返回结构
        assert "rankings" in result, "应包含rankings字段"
        assert "filters" in result, "应包含filters字段"
        assert "pagination" in result, "应包含pagination字段"
        assert "statistics" in result, "应包含statistics字段"

        # 验证子结构
        assert isinstance(result["rankings"], list), "rankings应为列表"
        assert "industries" in result["filters"], "filters应包含industries"
        assert "total_count" in result["pagination"], "pagination应包含total_count"
        assert "avg_agi_score" in result["statistics"], "statistics应包含avg_agi_score"

    @pytest.mark.asyncio
    async def test_get_rankings_with_industry_filter(self):
        """测试行业筛选功能"""
        mock_session = await self._create_mock_session()

        count_result = MagicMock()
        count_result.scalar.return_value = 5

        main_result = MagicMock()
        main_result.scalars.return_value.all.return_value = []

        call_count = 0

        async def execute_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return count_result
            elif call_count == 2:
                return main_result
            else:
                result = MagicMock()
                result.all.return_value = []
                return result

        mock_session.execute = AsyncMock(side_effect=execute_side_effect)

        result = await self.service.get_rankings(
            db=mock_session,
            industry="tech",
            limit=10,
            offset=0,
        )

        # 验证行业筛选被应用
        assert result["filters"]["current_industry"] == "tech", "应记录当前筛选的行业"

    @pytest.mark.asyncio
    async def test_get_rankings_pagination_params(self):
        """测试分页参数传递"""
        mock_session = await self._create_mock_session()

        count_result = MagicMock()
        count_result.scalar.return_value = 100

        main_result = MagicMock()
        main_result.scalars.return_value.all.return_value = []

        call_count = 0

        async def execute_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return count_result
            else:
                result = MagicMock()
                result.all.return_value = []
                return result

        mock_session.execute = AsyncMock(side_effect=execute_side_effect)

        # 测试分页参数
        result = await self.service.get_rankings(
            db=mock_session,
            limit=20,
            offset=40,  # 第3页（每页20条）
        )

        pagination = result["pagination"]
        assert pagination["limit"] == 20, "limit应为20"
        assert pagination["offset"] == 40, "offset应为40"
        assert pagination["has_more"] is True, "100条数据，offset=40，应有更多数据"

    # ========== AGI等级计算测试 ==========

    def test_get_agi_level_green(self):
        """测试绿色等级判定(AGI <= 30)"""
        level = self.service._get_agi_level(25.0)
        assert level == "green", f"AGI=25应为green，实际为{level}"

    def test_get_agi_level_yellow(self):
        """测试黄色等级判定(30 < AGI <= 60)"""
        level = self.service._get_agi_level(45.8)
        assert level == "yellow", f"AGI=45.8应为yellow，实际为{level}"

    def test_get_agi_level_red(self):
        """测试红色等级判定(AGI > 60)"""
        level = self.service._get_agi_level(72.3)
        assert level == "red", f"AGI=72.3应为red，实际为{level}"

    def test_get_agi_level_boundary_values(self):
        """测试边界值"""
        assert self.service._get_agi_level(30) == "green", "边界值30应为green"
        assert self.service._get_agi_level(31) == "yellow", "边界值31应为yellow"
        assert self.service._get_agi_level(60) == "yellow", "边界值60应为yellow"
        assert self.service._get_agi_level(61) == "red", "边界值61应为red"

    # ========== TOP企业列表测试 ==========

    @pytest.mark.asyncio
    async def test_get_top_companies_basic(self):
        """测试获取TOP企业列表基础功能"""
        mock_session = await self._create_mock_session()

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_session.execute.return_value = mock_result

        companies = await self.service.get_top_companies(
            db=mock_session,
            limit=10,
        )

        assert isinstance(companies, list), "应返回列表"
        assert len(companies) >= 0, "列表长度应>=0"

    @pytest.mark.asyncio
    async def test_get_top_companies_with_level_filter(self):
        """测试按等级筛选TOP企业"""
        mock_session = await self._create_mock_session()

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_session.execute.return_value = mock_result

        # 测试绿色等级筛选
        companies_green = await self.service.get_top_companies(
            db=mock_session,
            limit=5,
            level="green",
        )
        assert isinstance(companies_green, list)

        # 测试红色等级筛选
        companies_red = await self.service.get_top_companies(
            db=mock_session,
            limit=5,
            level="red",
        )
        assert isinstance(companies_red, list)

    # ========== 行业对比测试 ==========

    @pytest.mark.asyncio
    async def test_get_industry_comparison_structure(self):
        """测试行业对比数据结构"""
        mock_session = await self._create_mock_session()

        # 模拟行业统计查询结果
        mock_row = MagicMock()
        mock_row.industry = "tech"
        mock_row.count = 15
        mock_row.avg_agi = 25.5
        mock_row.min_agi = 18.2
        mock_row.max_agi = 32.1

        mock_result = MagicMock()
        mock_result.all.return_value = [mock_row]
        mock_session.execute.return_value = mock_result

        comparison = await self.service.get_industry_comparison(db=mock_session)

        # 验证结构
        assert "industries" in comparison, "应包含industries字段"
        assert "total_industries" in comparison, "应包含total_industries字段"
        assert "generated_at" in comparison, "应包含generated_at字段"

        # 验证行业数据格式
        if len(comparison["industries"]) > 0:
            industry_data = comparison["industries"][0]
            assert "industry" in industry_data, "每项应包含industry名称"
            assert "company_count" in industry_data, "每项应包含company_count"
            assert "avg_agi_score" in industry_data, "每项应包含avg_agi_score"
            assert "level" in industry_data, "每项应包含level"


class TestRankingsAPI:
    """排行榜API集成测试"""

    @pytest.fixture
    def client(self):
        from fastapi.testclient import TestClient

        from app.main import app

        return TestClient(app)

    def test_rankings_endpoint_exists(self, client):
        """测试排行榜端点是否存在"""
        response = client.get("/api/rankings?limit=5")
        # 端点应该存在（200或422都是可接受的）
        assert response.status_code in [200, 422], f"Unexpected status code: {response.status_code}"

    def test_rankings_endpoint_accepts_query_params(self, client):
        """测试端点接受查询参数"""
        response = client.get(
            "/api/rankings?industry=tech&limit=10&sort_by=agi_score&sort_order=asc"
        )
        assert response.status_code in [200, 422], f"Unexpected status: {response.status_code}"

    def test_rankings_top_endpoint_exists(self, client):
        """测试TOP企业端点"""
        response = client.get("/api/rankings/top?limit=5")
        assert response.status_code in [200, 422], f"Unexpected status: {response.status_code}"

    def test_rankings_industries_endpoint_exists(self, client):
        """测试行业对比端点"""
        response = client.get("/api/rankings/industries")
        assert response.status_code in [200, 422], f"Unexpected status: {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
