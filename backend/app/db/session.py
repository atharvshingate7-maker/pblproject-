import logging

logger = logging.getLogger("cyberintel.db.session")

# Stub — database is managed by Supabase (supabase-py client).
# SQLAlchemy is not used in this project.
# All DB access goes through app/db/supabase_client.py

class _FakeMeta:
    def create_all(self, *args, **kwargs):
        pass

class _FakeBase:
    metadata = _FakeMeta()

Base = _FakeBase()


class _FakeConn:
    async def run_sync(self, fn, *args, **kwargs):
        pass


class _FakeCtx:
    async def __aenter__(self):
        return _FakeConn()

    async def __aexit__(self, *args):
        pass


class _FakeEngine:
    def begin(self):
        return _FakeCtx()

    async def dispose(self):
        pass


engine = _FakeEngine()
