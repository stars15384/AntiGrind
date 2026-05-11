import io
from datetime import datetime
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


class PDFReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        self.styles.add(ParagraphStyle(
            name='ChineseTitle',
            fontName='Helvetica-Bold',
            fontSize=24,
            alignment=TA_CENTER,
            spaceAfter=20,
            textColor=colors.HexColor('#1e40af'),
        ))

        self.styles.add(ParagraphStyle(
            name='ChineseHeading',
            fontName='Helvetica-Bold',
            fontSize=16,
            alignment=TA_LEFT,
            spaceBefore=15,
            spaceAfter=10,
            textColor=colors.HexColor('#374151'),
        ))

        self.styles.add(ParagraphStyle(
            name='ChineseBody',
            fontName='Helvetica',
            fontSize=11,
            alignment=TA_LEFT,
            spaceBefore=5,
            spaceAfter=5,
            leading=16,
        ))

        self.styles.add(ParagraphStyle(
            name='ChineseCaption',
            fontName='Helvetica-Oblique',
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#6b7280'),
        ))

    def generate_certification_report(
        self,
        company_info: dict,
        agi_data: dict,
        work_hours_stats: dict,
        certification_info: dict,
        recommendations: Optional[list] = None,
        language: str = "zh"
    ) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm,
        )

        story = []
        story.extend(self._build_header(company_info, certification_info, language))
        story.append(Spacer(1, 0.5*cm))

        story.extend(self._build_agi_score_section(agi_data, language))
        story.append(Spacer(1, 0.3*cm))

        story.extend(self._build_dimensions_detail(agi_data.get('dimensions', {}), language))
        story.append(Spacer(1, 0.3*cm))

        story.extend(self._build_work_hours_section(work_hours_stats, language))
        story.append(Spacer(1, 0.3*cm))

        if recommendations:
            story.extend(self._build_recommendations(recommendations, language))
        story.append(Spacer(1, 0.5*cm))

        story.extend(self._build_footer(certification_info, language))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    def _build_header(self, company_info: dict, cert_info: dict, lang: str) -> list:
        elements = []

        title_text = "Anti-Grind Certification Report" if lang == "en" else "反内卷认证报告"
        elements.append(Paragraph(title_text, self.styles['ChineseTitle']))
        elements.append(Spacer(1, 0.3*cm))

        header_data = [
            ["Company Name / 公司名称", company_info.get('name', 'N/A')],
            ["Industry / 行业", company_info.get('industry', 'N/A') or 'N/A'],
            ["Location / 地区", company_info.get('location', 'N/A') or 'N/A'],
            ["Certification Level / 认证等级", cert_info.get('level', 'N/A').upper()],
            ["Issue Date / 颁发日期", cert_info.get('issue_date', 'N/A')],
            ["Expiry Date / 有效期至", cert_info.get('expiry_date', 'N/A')],
            ["Badge Code / 徽章编号", cert_info.get('badge_code', 'N/A')],
        ]

        table = Table(header_data, colWidths=[6*cm, 9*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ]))
        elements.append(table)

        return elements

    def _build_agi_score_section(self, agi_data: dict, lang: str) -> list:
        elements = []

        section_title = "AGI Score Overview / AGI评分总览" if lang == "zh" else "AGI Score Overview"
        elements.append(Paragraph(section_title, self.styles['ChineseHeading']))

        total_score = agi_data.get('total_score', 0)
        level = agi_data.get('level', 'unknown')

        level_colors = {
            'green': '#22c55e',
            'yellow': '#eab308',
            'red': '#ef4444',
        }
        color = level_colors.get(level, '#6b7280')

        score_display = [
            [f"{total_score}", f"Level: {level.upper()}" if lang == "en" else f"等级: {level.upper()}"],
        ]

        score_table = Table(score_display, colWidths=[5*cm, 10*cm])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor(color)),
            ('TEXTCOLOR', (0, 0), (0, 0), colors.white),
            ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#f9fafb')),
            ('TEXTCOLOR', (1, 0), (1, 0), colors.HexColor('#374151')),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 32),
            ('FONTSIZE', (1, 0), (1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOX', (0, 0), (-1, -1), 2, colors.HexColor(color)),
        ]))
        elements.append(score_table)

        return elements

    def _build_dimensions_detail(self, dimensions: dict, lang: str) -> list:
        elements = []

        title = "Detailed Dimension Scores / 各维度详细评分" if lang == "zh" else "Detailed Dimension Scores"
        elements.append(Paragraph(title, self.styles['ChineseHeading']))

        dim_names = {
            'hours_score': ('Working Hours / 工作时长' if lang == "zh" else 'Working Hours', 'hours'),
            'weekend_score': ('Weekend Policy / 周末政策' if lang == "zh" else 'Weekend Policy', 'policy'),
            'overtime_score': ('Overtime Compensation / 加班补偿' if lang == "zh" else 'Overtime Compensation', 'compensation'),
            'shift_score': ('Shift System / 轮班制度' if lang == "zh" else 'Shift System', 'shift'),
            'vibe_score': ('Work Atmosphere / 职场氛围' if lang == "zh" else 'Work Atmosphere', 'vibe'),
        }

        dim_data = [["Dimension / 维度", "Score / 得分", "Weight / 权重", "Weighted Score / 加权得分"]]
        for key, (name, _) in dim_names.items():
            if key in dimensions:
                dim = dimensions[key]
                value = dim.get('value', 0)
                weight = dim.get('weight', 0)
                weighted = round(value * weight, 2)
                dim_data.append([name, str(value), f"{weight*100}%", str(weighted)])

        dim_table = Table(dim_data, colWidths=[6*cm, 3*cm, 3*cm, 3*cm])
        dim_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ffffff')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f9fafb'), colors.white]),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1f2937')),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ]))
        elements.append(dim_table)

        return elements

    def _build_work_hours_section(self, stats: dict, lang: str) -> list:
        elements = []

        title = "Work Hours Statistics / 工时统计" if lang == "zh" else "Work Hours Statistics"
        elements.append(Paragraph(title, self.styles['ChineseHeading']))

        avg_hours = stats.get('avg_weekly_hours', 0)

        hours_data = [
            ["Metric / 指标", "Value / 数值"],
            ["Average Weekly Hours / 平均周工时", f"{avg_hours}h"],
            ["Standard Hours (40h) Compliance / 40h标准合规", "✓ Compliant" if avg_hours <= 40 else "⚠ Exceeded"],
        ]

        weekend_dist = stats.get('weekend_policy_distribution', {})
        if weekend_dist:
            for policy, count in weekend_dist.items():
                policy_name = {
                    'double_rest': 'Double Rest Day / 双休',
                    'big_small_week': 'Big-Small Week / 大小周',
                    'single_rest': 'Single Rest Day / 单休',
                    'no_rest': 'No Rest / 无休',
                }.get(policy, policy)
                hours_data.append([policy_name, str(count)])

        hours_table = Table(hours_data, colWidths=[8*cm, 7*cm])
        hours_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ecfdf5'), colors.white]),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1f2937')),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1fae5')),
        ]))
        elements.append(hours_table)

        return elements

    def _build_recommendations(self, recommendations: list, lang: str) -> list:
        elements = []

        title = "Recommendations / 改进建议" if lang == "zh" else "Recommendations"
        elements.append(Paragraph(title, self.styles['ChineseHeading']))

        for i, rec in enumerate(recommendations, 1):
            elements.append(Paragraph(f"{i}. {rec}", self.styles['ChineseBody']))

        return elements

    def _build_footer(self, cert_info: dict, lang: str) -> list:
        elements = []

        footer_text = f"""
        <br/><br/>
        <font size="9" color="#6b7280">
        This report is generated by AntiGrind Platform<br/>
        Report ID: {cert_info.get('badge_code', 'N/A')}<br/>
        Generated at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC<br/>
        Valid until: {cert_info.get('expiry_date', 'N/A')}
        </font>
        """
        elements.append(Paragraph(footer_text, self.styles['ChineseCaption']))

        disclaimer = """
        <br/>
        <font size="8" color="#9ca3af">
        Disclaimer: This report is based on employee submissions and community verification.<br/>
        The data reflects workplace conditions as reported and may not represent the complete picture.
        </font>
        """
        elements.append(Paragraph(disclaimer, self.styles['ChineseCaption']))

        return elements
