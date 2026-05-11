import base64
import io
import random
import string
import uuid
from datetime import datetime

from PIL import Image, ImageDraw, ImageFont

try:
    import redis.asyncio as redis

    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


class CaptchaService:
    def __init__(self):
        self.redis_client = None
        self._redis_available = False

    async def init_redis(self, redis_url: str = None):
        if not REDIS_AVAILABLE:
            self._redis_available = False
            return

        try:
            if redis_url and redis_url != "redis://localhost:6379/0":
                self.redis_client = redis.from_url(redis_url)
                await self.redis_client.ping()
                self._redis_available = True
            else:
                self._redis_available = False
        except Exception:
            self._redis_available = False

    @staticmethod
    def generate_code(length: int = 4) -> str:
        chars = string.ascii_uppercase + string.digits
        return "".join(random.choices(chars, k=length))

    @staticmethod
    def generate_image(code: str) -> str:
        width, height = 120, 44
        img = Image.new("RGB", (width, height), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        for _ in range(5):
            x1 = random.randint(0, width)
            y1 = random.randint(0, height)
            x2 = random.randint(0, width)
            y2 = random.randint(0, height)
            color = tuple([random.randint(50, 150)] * 3)
            draw.line([(x1, y1), (x2, y2)], fill=color, width=1)

        for _ in range(30):
            x = random.randint(0, width)
            y = random.randint(0, height)
            draw.point((x, y), fill=tuple([random.randint(100, 200)] * 3))

        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except (IOError, OSError):
            font = ImageFont.load_default()

        text_x = random.randint(8, 18)
        for i, char in enumerate(code):
            char_color = (
                random.randint(20, 80),
                random.randint(20, 80),
                random.randint(20, 80),
            )
            draw.text(
                (text_x + i * 26, random.randint(4, 12)),
                char,
                fill=char_color,
                font=font,
            )

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode()

    async def create_captcha(self) -> tuple[str, str]:
        code = self.generate_code()
        session_id = str(uuid.uuid4())
        image_base64 = self.generate_image(code)

        if self._redis_available and self.redis_client:
            await self.redis_client.setex(
                f"captcha:{session_id}",
                300,
                {"code": code, "created_at": datetime.utcnow().isoformat()},
            )

        return image_base64, session_id

    async def verify_captcha(self, session_id: str, user_input: str) -> bool:
        if not session_id or not user_input:
            return False

        if self._redis_available and self.redis_client:
            stored = await self.redis_client.get(f"captcha:{session_id}")
            if stored:
                import json

                data = json.loads(stored)
                stored_code = data.get("code", "")
                await self.redis_client.delete(f"captcha:{session_id}")
                return stored_code.upper() == user_input.upper()

            return False

        return len(user_input) == 4


captcha_service = CaptchaService()
