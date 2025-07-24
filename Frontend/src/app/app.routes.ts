import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { AddProductComponent } from './pages/add-product/add-product.component'; // Import AddProductComponent
import { DynamicFormComponent } from './pages/product-details/dynamic-form.component'; // Import DynamicFormComponent

export const routes: Routes = [
    {
        path: 'dashboard', // No leading slash
        component: Dashboard
    },
    {
        path: 'product-list', // No leading slash
        component: ProductListComponent
    },
    {
        path: 'add-product', // Route for AddProductComponent
        component: AddProductComponent
    },
    {
        path: 'dynamic-form', // Route for DynamicFormComponent
        component: DynamicFormComponent
    },
    {
        path: '', // Default route - redirects to 'dashboard'
        redirectTo: 'dashboard',
        pathMatch: 'full' // Ensures the entire path matches
    },
    {
        path: '**', // Wildcard route for any other invalid URL
        redirectTo: 'dashboard' // Redirect to dashboard for unknown paths
    }
];