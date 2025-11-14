from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

# Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

query = supabase.table("stock_trade").select("*").order("date").execute()

print(type(query.data))
