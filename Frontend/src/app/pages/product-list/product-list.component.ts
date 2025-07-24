import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

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
  imports: [CommonModule],
})
export class ProductListComponent implements OnInit {
  private allProductsSubject = new BehaviorSubject<Product[]>([]);
  products$: Observable<Product[]> | undefined;
  paginatedProducts$: Observable<Product[]> | undefined;

  // Pagination properties
  private currentPageSubject = new BehaviorSubject<number>(1);
  currentPage$ = this.currentPageSubject.asObservable();
  itemsPerPage: number = 5;
  totalPages: number = 0;

  // Filter selection
  selectedStatus: string | null = null;
  // selectedCategory: string | null = null; // Removed

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch all products initially
    this.http.get<Product[]>('http://127.0.0.1:8000/products').subscribe((products) => {
      this.allProductsSubject.next(products);
      this.calculateTotalPages(products.length);
    });

    // Combine latest values from allProductsSubject, currentPageSubject, and filter selections
    this.paginatedProducts$ = combineLatest([
      this.allProductsSubject.asObservable(),
      this.currentPageSubject.asObservable(),
    ]).pipe(
      map(([products, currentPage]) => {
        let filteredProducts = products;

        // Apply status filter
        if (this.selectedStatus !== null) {
          const inStock = this.selectedStatus === 'Active';
          filteredProducts = filteredProducts.filter((product) => product.inStock === inStock);
        }

        // Removed category filter logic
        /*
        if (this.selectedCategory !== null) {
          filteredProducts = filteredProducts.filter(product => product.category === this.selectedCategory);
        }
        */

        // Calculate total pages based on filtered products
        this.calculateTotalPages(filteredProducts.length);

        // Apply pagination
        const startIndex = (currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
      })
    );
  }

  // Method to calculate total pages
  private calculateTotalPages(totalItems: number): void {
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
    // Ensure currentPage doesn't exceed totalPages after filtering/data change
    if (this.currentPageSubject.getValue() > this.totalPages && this.totalPages > 0) {
      this.currentPageSubject.next(this.totalPages);
    } else if (this.totalPages === 0 && this.currentPageSubject.getValue() !== 1) {
      this.currentPageSubject.next(1); // Reset to page 1 if no products
    }
  }

  // Method to set status filter
  setStatusFilter(status: string | null): void {
    this.selectedStatus = status;
    this.currentPageSubject.next(1); // Reset to first page when filter changes
    // Trigger re-filtering by emitting a new value to the subject
    this.allProductsSubject.next(this.allProductsSubject.getValue());
  }

  // Removed category filter method
  /*
  setCategoryFilter(category: string | null): void {
    this.selectedCategory = category;
    this.currentPageSubject.next(1);
    this.allProductsSubject.next(this.allProductsSubject.getValue());
  }
  */

  getProductStatus(inStock: boolean): string {
    return inStock ? 'Active' : 'Inactive';
  }

  getProductAvailability(inStock: boolean): string {
    return inStock ? 'In Stock' : 'Out of Stock';
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageSubject.next(page);
    }
  }

  nextPage(): void {
    if (this.currentPageSubject.getValue() < this.totalPages) {
      this.currentPageSubject.next(this.currentPageSubject.getValue() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPageSubject.getValue() > 1) {
      this.currentPageSubject.next(this.currentPageSubject.getValue() - 1);
    }
  }

  // Method to get an array of page numbers for ngFor
  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}