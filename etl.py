#!/usr/bin/env python3
"""
etl.py

1. Fetches live parking‑meter records from Vancouver’s Open Data Portal
2. Normalizes into a DataFrame and extracts meterid, time limits, coords
3. Loads your manual meter_rates.csv (keyed by meterid) and merges rates
4. Creates parking_meters table (with PRIMARY KEY on meterid) in MySQL
5. Inserts all rows into parking_meters
"""

import os
from dotenv import load_dotenv
import requests
import pandas as pd
from sqlalchemy import create_engine, text

# ─── 1) Load environment variables ───────────────────────────
load_dotenv()
DB_URL   = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
    f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)
DB_SSL_CA = os.getenv("DB_SSL_CA", "./public/aiven-ca.pem")

# ─── 2) Fetch parking‑meters from Socrata ─────────────────────
resp = requests.get(
    "https://opendata.vancouver.ca/api/records/1.0/search/",
    params={"dataset": "parking-meters", "rows": 5000},
    verify=False
)
resp.raise_for_status()
records = resp.json()["records"]

# ─── 3) Normalize JSON → DataFrame, extract fields ───────────
df = pd.json_normalize(records)
df["longitude"]      = df["geometry.coordinates"].apply(lambda c: c[0])
df["latitude"]       = df["geometry.coordinates"].apply(lambda c: c[1])
df["meterid"]        = df["fields.meterid"].astype(str)
df["weekday_limit"]  = df["fields.t_mf_9a_6p"]
df["weekend_limit"]  = df["fields.t_sa_6p_10"]

df_meters = df[[
    "meterid",
    "weekday_limit",
    "weekend_limit",
    "longitude",
    "latitude"
]]

# ─── 4) Load your manual meter_rates.csv and merge on meterid ──
df_rates = pd.read_csv("meter_rates.csv", dtype={"meterid": str, "rate": str})
df_joined = pd.merge(
    df_meters,
    df_rates,
    on="meterid",
    how="left"
).fillna({"rate": "—"})

# ─── 5) Write to MySQL with PRIMARY KEY on meterid ────────────
engine = create_engine(DB_URL, connect_args={ "ssl": { "ca": DB_SSL_CA } })

with engine.begin() as conn:
    # Drop and recreate the table with meterid as primary key
    conn.execute(text("DROP TABLE IF EXISTS parking_meters"))
    conn.execute(text("""
      CREATE TABLE parking_meters (
        meterid       VARCHAR(64)    NOT NULL PRIMARY KEY,
        weekday_limit VARCHAR(32),
        weekend_limit VARCHAR(32),
        longitude     DOUBLE,
        latitude      DOUBLE,
        rate          VARCHAR(16)
      )
    """))

# Bulk insert all rows
df_joined.to_sql("parking_meters", engine, if_exists="append", index=False)
print(f"✅ Loaded {len(df_joined)} records into parking_meters")
