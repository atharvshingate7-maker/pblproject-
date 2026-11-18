import io
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_file_upload_and_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Upload sample text file
        file_content = b"alert tcp any any -> any 8080 (msg:'C2 Beacon detected'; sid:100001;)"
        files = {
            "file": ("evidence_sample.txt", io.BytesIO(file_content), "text/plain")
        }

        upload_res = await client.post("/api/files/upload", files=files)
        assert upload_res.status_code == 201
        data = upload_res.json()
        assert data["status"] == "success"
        file_info = data["file"]
        file_id = file_info["id"]
        assert file_info["original_name"] == "evidence_sample.txt"
        assert len(file_info["sha256_hash"]) == 64

        # 2. Get file details
        get_res = await client.get(f"/api/files/{file_id}")
        assert get_res.status_code == 200
        assert get_res.json()["id"] == file_id

        # 3. List user files
        list_res = await client.get("/api/files?page=1&page_size=10")
        assert list_res.status_code == 200
        list_data = list_res.json()
        assert list_data["total"] >= 1
        assert any(item["id"] == file_id for item in list_data["items"])

        # 4. Delete file
        del_res = await client.delete(f"/api/files/{file_id}")
        assert del_res.status_code == 200
        assert del_res.json()["status"] == "success"

        # 5. Verify 404 after deletion
        get_after_del = await client.get(f"/api/files/{file_id}")
        assert get_after_del.status_code == 404
