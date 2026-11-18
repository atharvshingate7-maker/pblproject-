#!/usr/bin/env python3
"""
Standalone Supabase Connection Test Script
Run with: python scripts/test_supabase.py
"""

import os
import sys
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env")
except ImportError:
    pass

from supabase import create_client


def print_status(status: str, message: str):
    colors = {
        "OK": "\033[92m[SUCCESS]\033[0m",
        "WARN": "\033[93m[WARNING]\033[0m",
        "FAIL": "\033[91m[FAILURE]\033[0m",
        "INFO": "\033[94m[INFO]\033[0m"
    }
    print(f"{colors.get(status, '[INFO]')} {message}")


def main():
    print("=" * 60)
    print("🚀 CyberIntel AI — Supabase Connection Diagnostic")
    print("=" * 60)

    url = os.getenv("SUPABASE_URL", "").strip()
    pub_key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip()
    secret_key = os.getenv("SUPABASE_SECRET_KEY", "").strip()
    bucket = os.getenv("SUPABASE_STORAGE_BUCKET", "files").strip()

    # 1. Check URL
    if not url:
        print_status("FAIL", "SUPABASE_URL is missing in .env")
        return sys.exit(1)
    
    # Strip trailing /rest/v1 or slashes
    if url.endswith("/rest/v1/"):
        url = url[:-9]
    elif url.endswith("/rest/v1"):
        url = url[:-8]
    url = url.rstrip("/")

    print_status("INFO", f"Project URL: {url}")

    # 2. Check Publishable Key
    if not pub_key:
        print_status("FAIL", "SUPABASE_PUBLISHABLE_KEY is missing in .env")
        return sys.exit(1)
    print_status("INFO", f"Publishable Key: {pub_key[:12]}...{pub_key[-6:]}")

    # 3. Test Public Client (Database Connectivity)
    print("\n--- 1. Testing Database Connection via Publishable Key ---")
    try:
        public_client = create_client(url, pub_key)
        # Attempt select query on profiles table
        try:
            res = public_client.table("profiles").select("id").limit(1).execute()
            print_status("OK", "Connected to Supabase PostgreSQL database!")
            print_status("INFO", f"Table 'profiles' is online and queryable. Rows returned: {len(res.data)}")
        except Exception as query_err:
            err_str = str(query_err)
            if "does not exist" in err_str.lower():
                print_status("WARN", "Reached Supabase successfully, but 'profiles' table does not exist yet.")
                print_status("INFO", "👉 Run the SQL script in backend/app/db/schema.sql inside your Supabase SQL Editor!")
            else:
                raise query_err
    except Exception as e:
        print_status("FAIL", f"Failed to connect to Supabase: {e}")
        return sys.exit(1)

    # 4. Test Admin Client (Storage & Management)
    print("\n--- 2. Testing Admin Operations (Secret Key) ---")
    if not secret_key or secret_key == "your_secret_key_here":
        print_status("WARN", "SUPABASE_SECRET_KEY is still set to placeholder 'your_secret_key_here'.")
        print_status("INFO", "Add your service_role / secret key to .env when ready to test storage buckets & admin tasks.")
    else:
        try:
            admin_client = create_client(url, secret_key)
            buckets = admin_client.storage.list_buckets()
            bucket_names = [b.name for b in buckets]
            print_status("OK", f"Admin client connected successfully! Found buckets: {bucket_names}")

            if bucket in bucket_names:
                print_status("OK", f"Configured storage bucket '{bucket}' exists.")
            else:
                print_status("WARN", f"Storage bucket '{bucket}' not found. Create it in Supabase Dashboard -> Storage.")
        except Exception as e:
            print_status("FAIL", f"Admin client test failed: {e}")

    print("\n" + "=" * 60)
    print_status("OK", "Supabase diagnostics finished.")
    print("=" * 60)


if __name__ == "__main__":
    main()
