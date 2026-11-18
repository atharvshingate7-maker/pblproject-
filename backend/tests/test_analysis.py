import io
import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_analysis_trigger_and_result():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Upload sample payload
        file_content = b"powershell.exe -enc JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0AA=="
        files = {
            "file": ("suspicious_script.log", io.BytesIO(file_content), "text/plain")
        }
        upload_res = await client.post("/api/files/upload", files=files)
        assert upload_res.status_code == 201
        file_id = upload_res.json()["file"]["id"]

        # 2. Trigger analysis
        trigger_res = await client.post(f"/api/analysis/{file_id}")
        assert trigger_res.status_code == 202
        trigger_data = trigger_res.json()
        job_id = trigger_data["job_id"]
        assert trigger_data["initial_status"] == "queued"

        # 3. Poll for completion
        for _ in range(10):
            await asyncio.sleep(0.3)
            status_res = await client.get(f"/api/analysis/{job_id}")
            assert status_res.status_code == 200
            job_data = status_res.json()
            if job_data["status"] == "completed":
                break

        assert job_data["status"] == "completed"
        assert job_data["progress"] == 100
        assert job_data["result"] is not None
        result = job_data["result"]
        assert result["verdict"] in ["clean", "suspicious", "malicious", "inconclusive"]
        assert 0 <= result["threat_score"] <= 100
