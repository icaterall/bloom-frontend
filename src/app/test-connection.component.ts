import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-test-connection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Backend Connection Test</h1>
      
      <div class="space-y-4">
        <div class="border rounded p-4">
          <h3 class="font-semibold">API URL:</h3>
          <p class="text-sm">{{ apiUrl }}</p>
        </div>
        
        <button 
          (click)="testHealth()" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Health Check
        </button>
        
        <button 
          (click)="testDatabase()" 
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
        >
          Test Database
        </button>
        
        <div *ngIf="results.length > 0" class="border rounded p-4 bg-gray-50">
          <h3 class="font-semibold mb-2">Results:</h3>
          <div *ngFor="let result of results" class="mb-2">
            <span [class]="result.success ? 'text-green-600' : 'text-red-600'">
              {{ result.message }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TestConnectionComponent {
  apiUrl = environment.apiUrl;
  results: any[] = [];
  
  constructor(private http: HttpClient) {}
  
  testHealth() {
    this.results = [];
    const url = `${this.apiUrl}/health`;
    console.log('Testing health at:', url);
    
    this.http.get(url).subscribe({
      next: (response: any) => {
        console.log('Health check success:', response);
        this.results.push({
          success: true,
          message: `✅ Health Check: ${response.message} at ${response.timestamp}`
        });
      },
      error: (error) => {
        console.error('Health check failed:', error);
        this.results.push({
          success: false,
          message: `❌ Health Check Failed: ${error.message || 'Cannot connect to backend'}`
        });
      }
    });
  }
  
  testDatabase() {
    this.results = [];
    const url = `${this.apiUrl}/test/db-test`;
    console.log('Testing database at:', url);
    
    this.http.get(url).subscribe({
      next: (response: any) => {
        console.log('Database test success:', response);
        if (response.success) {
          this.results.push({
            success: true,
            message: `✅ Database Connected: ${response.data.connection}`
          });
          this.results.push({
            success: true,
            message: `✅ User Count: ${response.data.userCount}`
          });
          this.results.push({
            success: true,
            message: `✅ Admin Exists: ${response.data.adminExists}`
          });
          if (response.data.adminDetails) {
            this.results.push({
              success: true,
              message: `✅ Admin Email: ${response.data.adminDetails.email}`
            });
          }
        }
      },
      error: (error) => {
        console.error('Database test failed:', error);
        this.results.push({
          success: false,
          message: `❌ Database Test Failed: ${error.message || 'Cannot connect to database'}`
        });
      }
    });
  }
}
