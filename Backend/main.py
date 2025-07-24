from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import date, datetime
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware

# Import your models from models.py
from models import User, Product

# Import your collections from database.py
from database import user_collection, product_collection

app = FastAPI()

# --- CORS Configuration ---
# Define the origins that are allowed to access your API
# For development, you might use ["*"] to allow all origins,
# but in production, you should specify the exact origins of your frontend.
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:4200"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to convert ObjectId to string and prepare for Pydantic
def serialize_object_id(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Converts MongoDB's _id (ObjectId) to a string 'id' in a new dictionary.
    This ensures Pydantic receives 'id' as a string and doesn't get confused by _id.
    """
    new_data = data.copy() # Work on a copy to avoid modifying the original cursor dict directly
    if "_id" in new_data:
        new_data["id"] = str(new_data["_id"])
        del new_data["_id"] # Remove the ObjectId version
    return new_data

# --- User Endpoints ---

@app.post("/users", response_model=Dict[str, str], status_code=status.HTTP_201_CREATED)
async def create_user(user: User):
    user_dict = jsonable_encoder(user)
    # Ensure _id is not passed when creating, as MongoDB generates it
    user_dict.pop("id", None) # 'id' comes from Pydantic model, but is for client
    result = await user_collection.insert_one(user_dict)
    return {"id": str(result.inserted_id)}

@app.get("/users", response_model=List[User])
async def get_users():
    users = []
    async for user in user_collection.find():
        users.append(User(**serialize_object_id(user)))
    return users

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format")
    user = await user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return User(**serialize_object_id(user))

@app.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user: User):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format")
    user_dict = jsonable_encoder(user)
    # Remove _id and id from the update payload to prevent modification errors
    user_dict.pop("_id", None) # Ensure _id (ObjectId) isn't in the $set
    user_dict.pop("id", None)  # Ensure 'id' (str) isn't in the $set

    update_result = await user_collection.update_one({"_id": ObjectId(user_id)}, {"$set": user_dict})
    if update_result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    updated_user = await user_collection.find_one({"_id": ObjectId(user_id)})
    return User(**serialize_object_id(updated_user))

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format")
    delete_result = await user_collection.delete_one({"_id": ObjectId(user_id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return

# --- Product Endpoints ---

@app.post("/products", response_model=Dict[str, str], status_code=status.HTTP_201_CREATED)
async def create_product(product: Product):
    product_dict = jsonable_encoder(product)
    product_dict.pop("id", None)
    result = await product_collection.insert_one(product_dict)
    return {"id": str(result.inserted_id)}

@app.get("/products", response_model=List[Product])
async def get_products():
    products = []
    async for product in product_collection.find():
        products.append(Product(**serialize_object_id(product)))
    return products

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Product ID format")
    product = await product_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return Product(**serialize_object_id(product))

@app.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: Product):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Product ID format")
    product_dict = jsonable_encoder(product)
    product_dict.pop("_id", None)
    product_dict.pop("id", None)
    update_result = await product_collection.update_one({"_id": ObjectId(product_id)}, {"$set": product_dict})
    if update_result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    updated_product = await product_collection.find_one({"_id": ObjectId(product_id)})
    return Product(**serialize_object_id(updated_product))

@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Product ID format")
    delete_result = await product_collection.delete_one({"_id": ObjectId(product_id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return