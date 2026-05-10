import { Component, OnInit } from "@angular/core";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";

interface Product {
    _id: {
        $oid: string;
    };
    productId: string;
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
    selector: 'app-dashboard',
    standalone: true,
    imports: [NavbarComponent, CommonModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

    totalProducts: number = 0;
    totalSales: string = "";
    averageOrderValue: number = 0;

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.fetchKeyMetrics();
    }

    fetchKeyMetrics(): void {
        this.http.get<Product[]>('http://127.0.0.1:8000/products').subscribe(
            (data: Product[]) => {

                this.totalProducts = data.length;

                let totalRevenue = 0;
                let totalOrders = 0;

                data.forEach(product => {
                    totalRevenue += (
                        product.salePrice > 0
                            ? product.salePrice
                            : product.price
                    ) * product.quantity;

                    totalOrders += product.quantity;
                });

                let crore = totalRevenue / 10000000;

                this.totalSales = `${crore.toFixed(2)} Cr`;

                this.averageOrderValue = totalOrders > 0
                    ? totalRevenue / totalOrders
                    : 0;
            },
            (error) => {
                console.error('Error fetching product data:', error);
            }
        );
    }
}