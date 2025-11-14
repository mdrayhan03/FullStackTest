from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# -------------------------
# Supabase client
# -------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
table = os.getenv("TABLE_NAME")

# -------------------------
# FastAPI app
# -------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Pydantic models
# -------------------------
class TradeIn(BaseModel):
    trade_code: str
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class TradeOut(TradeIn):
    id: int

# -------------------------
# Helper function
# -------------------------
def clean_trade_data(trade: dict) -> dict:
    """Ensure numeric fields are proper types."""
    return {
        "trade_code": trade.get("trade_code").upper(),
        "date": trade.get("date"),
        "open": float(trade.get("open")),
        "high": float(trade.get("high")),
        "low": float(trade.get("low")),
        "close": float(trade.get("close")),
        "volume": int(str(trade.get("volume")).replace(",", ""))
    }

# -------------------------
# CRUD Endpoints (Async-friendly)
# -------------------------
@app.get("/ping")
async def ping():
    return {"status": "ok"}

@app.get("/api/trades", response_model=List[TradeOut])
async def list_trades(trade_code: Optional[str] = None):
    def query_db():
        q = supabase.table(table).select("*")
        if trade_code:
            q = q.eq("trade_code")
        return q.execute()
    
    result = await run_in_threadpool(query_db)

    if result.data is None:
        raise HTTPException(status_code=500, detail="Database returned no data.")
    
    return result.data

@app.post("/api/trades", response_model=TradeOut)
async def create_trade(trade: TradeIn):
    trade_dict = clean_trade_data(trade.dict())

    def insert_db():
        return supabase.table(table).insert(trade_dict).execute()
    
    data = await run_in_threadpool(insert_db)

    if data.data is None:
        raise HTTPException(status_code=500, detail="Failed to insert trade.")

    inserted_trade = trade_dict
    inserted_trade["id"] = data.data[0]["id"]
    return inserted_trade

@app.put("/api/trades/{trade_id}", response_model=TradeOut)
async def update_trade(trade_id: int, trade: TradeIn):
    trade_dict = clean_trade_data(trade.dict())

    def update_db():
        return supabase.table(table).update(trade_dict).eq("id", trade_id).execute()
    
    data = await run_in_threadpool(update_db)

    if data.data is None:
        raise HTTPException(status_code=500, detail="Failed to update trade.")

    updated_trade = trade_dict
    updated_trade["id"] = trade_id
    return updated_trade

@app.delete("/api/trades/{trade_id}")
async def delete_trade(trade_id: int):
    def delete_db():
        return supabase.table(table).delete().eq("id", trade_id).execute()
    
    data = await run_in_threadpool(delete_db)

    if data.data is None:
        raise HTTPException(status_code=500, detail="Failed to delete trade.")
    
    return {"status": "deleted"}