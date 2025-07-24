from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field, ConfigDict # Import ConfigDict

class User(BaseModel):
    # Pydantic V2 way to handle aliases and serialization
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    # populate_by_name=True allows initialization by field name or alias
    # arbitrary_types_allowed=True might be needed if you were handling ObjectId directly, but not strictly for this alias setup

    id: Optional[str] = Field(None, alias="_id") # Map _id from MongoDB to 'id'
    name: str
    action: str
    timestamp: datetime # Changed to datetime to match MongoDB's storage
    details: str

class Product(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: Optional[str] = Field(None, alias="_id") # Map _id from MongoDB to 'id'
    name: str
    desc: str
    category: str
    brand: str
    SKU: Optional[str] = None # Made SKU optional
    price: float # Changed to float
    salePrice: float # Changed to float
    inStock: bool
    quantity: int
    imageUrl: Optional[HttpUrl] = None