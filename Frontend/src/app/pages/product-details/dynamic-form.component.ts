import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface FormField {
  label: string;
  type: string;
  placeholder?: string;
  name: string;
  required: boolean;
  options?: { label: string; value: string }[];
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnInit {
  userForm!: FormGroup;
  formFields: FormField[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFormConfiguration();
  }

  loadFormConfiguration(): void {
    // Load from assets/widget.json
    this.http.get<FormField[]>('widget.json').subscribe({
      next: (fields) => {
        this.formFields = fields;
        this.buildDynamicForm();
      },
      error: (error) => {
        console.error('Error loading form configuration:', error);
        // Fallback to hardcoded fields if file loading fails
        this.useDefaultFields();
        this.buildDynamicForm();
      }
    });
  }

  useDefaultFields(): void {
    this.formFields = [
      {
        "label": "Full Name",
        "type": "text",
        "placeholder": "Enter your full name",
        "name": "fullName",
        "required": true
      },
      {
        "label": "Email",
        "type": "email",
        "placeholder": "Enter your email",
        "name": "email",
        "required": true
      },
      // ... rest of your default fields
    ];
  }

  buildDynamicForm(): void {
    const formGroup: any = {};
    
    this.formFields.forEach(field => {
      const validators = [];
      
      if (field.required) {
        if (field.type === 'checkbox') {
          validators.push(Validators.requiredTrue);
        } else {
          validators.push(Validators.required);
        }
      }
      
      // Add specific validators based on field type
      if (field.type === 'email') {
        validators.push(Validators.email);
      }
      
      if (field.type === 'password') {
        validators.push(Validators.minLength(6));
      }
      
      // Set default value based on field type
      const defaultValue = field.type === 'checkbox' ? false : '';
      
      formGroup[field.name] = [defaultValue, validators];
    });
    
    this.userForm = this.fb.group(formGroup);
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      console.log('Form Data:', this.userForm.value);
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getFormControl(fieldName: string) {
    return this.userForm.get(fieldName);
  }

  hasError(fieldName: string, errorType: string): boolean {
    const control = this.getFormControl(fieldName);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.getFormControl(fieldName);
    return !!(control?.invalid && control?.touched);
  }
}