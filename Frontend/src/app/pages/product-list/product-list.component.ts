import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Import HttpParams
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs'; // Import BehaviorSubject and combineLatest
import { switchMap, map } from 'rxjs/operators'; // Import operators

// Define an interface for your product data for better type safety
interface Product {
  _id: string;
  name: string;
  desc: string;
  category: string;
  brand: string;
  SKU: string;
  price: number;
  salePrice: number;
  inStock: boolean;
  quantity: number;
  imageUrl: string;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ProductListComponent implements OnInit {
  private allProductsSubject = new BehaviorSubject<Product[]>([]);
  products$: Observable<Product[]> | undefined;

  // Filter selections
  selectedStatus: string | null = null;
  selectedCategory: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch all products initially
    this.http.get<Product[]>('http://127.0.0.1:8000/products').subscribe(
      products => this.allProductsSubject.next(products)
    );

    // Combine latest values from allProductsSubject and filter selections
    this.products$ = combineLatest([
      this.allProductsSubject.asObservable()
    ]).pipe(
      map(([products]) => {
        let filteredProducts = products;

        // Apply status filter
        if (this.selectedStatus !== null) {
          const inStock = this.selectedStatus === 'Active';
          filteredProducts = filteredProducts.filter(product => product.inStock === inStock);
        }

        // Apply category filter
        if (this.selectedCategory !== null) {
          filteredProducts = filteredProducts.filter(product => product.category === this.selectedCategory);
        }
        return filteredProducts;
      })
    );
  }

  // Method to set status filter
  setStatusFilter(status: string | null): void {
    this.selectedStatus = status;
    // Trigger re-filtering by emitting a new value to the subject
    this.allProductsSubject.next(this.allProductsSubject.getValue());
  }

  // Method to set category filter (you'll need to implement a way to select categories)
  setCategoryFilter(category: string | null): void {
    this.selectedCategory = category;
    // Trigger re-filtering by emitting a new value to the subject
    this.allProductsSubject.next(this.allProductsSubject.getValue());
  }

  getProductStatus(inStock: boolean): string {
    return inStock ? 'Active' : 'Inactive';
  }

  getProductAvailability(inStock: boolean): string {
    return inStock ? 'In Stock' : 'Out of Stock';
  }
}