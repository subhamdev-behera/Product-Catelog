from motor.motor_asyncio import AsyncIOMotorClient # Import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Use AsyncIOMotorClient for asynchronous operations
client = AsyncIOMotorClient(MONGO_URI)
db = client["myDatabase"]

# Collections for each model
user_collection = db["users"]
product_collection = db["products"]