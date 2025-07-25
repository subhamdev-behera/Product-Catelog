import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import formFields from '../../../../public/widget.json';
import { NavbarComponent } from '../../components/navbar/navbar.component';

interface FormField {
  label: string;
  type: string;
  placeholder?: string;
  name: string;
  required: boolean;
  options?: { label: string; value: string }[];
}

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NavbarComponent
  ]
})
export class AddProductComponent implements OnInit {
  product: { [key: string]: any } = {};
  fields: FormField[] = formFields;

  private apiUrl = 'http://127.0.0.1:8000/products';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initializeProduct();
  }

  initializeProduct() {
    this.fields.forEach(field => {
      if (field.required) {
        if (field.type === 'number') {
          this.product[field.name] = 0; // Initialize required number fields to 0
        } else if (field.type === 'checkbox') {
          this.product[field.name] = false;
        } else {
          this.product[field.name] = '';
        }
      } else {
        // For optional fields
        if (field.type === 'number') {
          this.product[field.name] = null; // Optional numbers can be null
        } else if (field.type === 'checkbox') {
          this.product[field.name] = false;
        } else {
          this.product[field.name] = '';
        }
      }
    });

    // Ensure 'inStock' is true by default as per your original logic
    this.product['inStock'] = true;
  }

  createProduct() {
    // Client-side validation for required fields
    const missingRequiredFields = this.fields.filter(field => {
      // If a field is required
      if (field.required) {
        // Check if its value is null or an empty string
        if (this.product[field.name] === null || this.product[field.name] === '') {
          return true; // It's missing
        }
        // For number fields, also check if the value is not a valid number
        if (field.type === 'number' && isNaN(parseFloat(this.product[field.name]))) {
          return true; // It's not a valid number
        }
      }
      return false; // Field is not missing or invalid
    });


    if (missingRequiredFields.length > 0) {
      alert(`Please fill in all required fields: ${missingRequiredFields.map(f => f.label).join(', ')}`);
      return;
    }

    // Construct the payload - no special mapping needed now as JSON field names match FastAPI model
    const payload: { [key: string]: any } = {};
    for (const key in this.product) {
      if (Object.prototype.hasOwnProperty.call(this.product, key)) {
        // Handle HttpUrl: send null if imageUrl is an empty string
        if (key === 'imageUrl' && this.product[key] === '') {
          payload[key] = null;
        } else {
          payload[key] = this.product[key];
        }
      }
    }

    // Explicitly set `SKU` to null if it's an empty string, as FastAPI expects Optional[str]
    if (payload['SKU'] === '') {
        payload['SKU'] = null;
    }
    // Explicitly set `brand` to null if it's an empty string, as FastAPI expects Optional[str]
    if (payload['brand'] === '') {
        payload['brand'] = null;
    }
    // Explicitly set `desc` to null if it's an empty string and optional
    // Check if the 'desc' field exists and is NOT required in the fields.json
    const descField = this.fields.find(f => f.name === 'desc');
    if (descField && !descField.required && payload['desc'] === '') {
        payload['desc'] = null;
    }


    console.log('Sending payload:', payload);

    this.http.post(this.apiUrl, payload).subscribe(
      (response) => {
        console.log('Product created successfully:', response);
        alert('Product created successfully!');
        this.resetForm();
      },
      (error) => {
        console.error('Error creating product:', error);
        if (error.error && error.error.detail) {
          console.error('FastAPI validation errors:', error.error.detail);
          alert('Error creating product. Please check the console for detailed validation errors.');
        } else {
          alert('Error creating product. Please try again. Check console for details.');
        }
      }
    );
  }

  resetForm() {
    this.initializeProduct(); // Re-initialize to reset all fields
  }
}