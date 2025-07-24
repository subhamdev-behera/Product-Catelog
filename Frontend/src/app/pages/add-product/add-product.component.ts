// src/app/add-product/add-product.component.ts
import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ]
})
export class AddProductComponent {
  product = {
    name: '',
    desc: '',
    category: '',
    brand: '',
    SKU: null as string | null, // Initialize as null for optional string, or '' if you prefer to send empty string
    price: null as number | null, // Initialize as null. You must fill this in the UI.
    salePrice: null as number | null, // Initialize as null. You must fill this in the UI.
    inStock: true,
    quantity: null as number | null, // Initialize as null. You must fill this in the UI.
    imageUrl: null as string | null // Initialize as null for optional HttpUrl
  };

  private apiUrl = 'http://127.0.0.1:8000/products';

  constructor(private http: HttpClient) {}

  createProduct() {
    // Basic client-side validation to ensure required numbers are not null
    if (this.product.price === null || this.product.salePrice === null || this.product.quantity === null) {
      alert('Please fill in Price, Compare at price, and Quantity.');
      return; // Stop the function if validation fails
    }

    const payload = {
      name: this.product.name,
      desc: this.product.desc,
      category: this.product.category,
      brand: this.product.brand,
      SKU: this.product.SKU, // Will be null or a string
      price: this.product.price,
      salePrice: this.product.salePrice,
      inStock: this.product.inStock,
      quantity: this.product.quantity,
      // Send null if imageUrl is an empty string, otherwise send the URL string
      imageUrl: this.product.imageUrl === '' ? null : this.product.imageUrl
    };

    console.log('Sending payload:', payload); // Log the payload before sending

    this.http.post(this.apiUrl, payload).subscribe(
      (response) => {
        console.log('Product created successfully:', response);
        alert('Product created successfully!');
        this.resetForm();
      },
      (error) => {
        console.error('Error creating product:', error);
        // You can log error.error.detail to see FastAPI's specific validation errors
        console.error('FastAPI validation errors:', error.error.detail);
        alert('Error creating product. Please try again. Check console for details.');
      }
    );
  }

  resetForm() {
    this.product = {
      name: '',
      desc: '',
      category: '',
      brand: '',
      SKU: null,
      price: null,
      salePrice: null,
      inStock: true,
      quantity: null,
      imageUrl: null
    };
  }
}