import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../services/data.service';
import { TestResult } from '../../models/trainee.types';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-data-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule
  ],
  templateUrl: './data-page.component.html',
  styleUrls: ['./data-page.component.scss']
})
export class DataPageComponent {
  private dataService = inject(DataService);
  
  // Data source
  results = toSignal(this.dataService.loadResults(), { initialValue: [] as TestResult[] });
  
  // UI state
  filterText = signal('');
  pageIndex = signal(0);
  pageSize = signal(10);
  
  // Table configuration
  displayedColumns = ['traineeName', 'subject', 'grade', 'date'];
  
  // Computed values
  filtered = computed(() => {
    const filter = this.filterText().toLowerCase();
    return this.results().filter(result => 
      result.traineeName.toLowerCase().includes(filter) ||
      result.subject.toLowerCase().includes(filter)
    );
  });
  
  page = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.filtered().slice(start, end);
  });
  
  // Event handlers
  onFilterChange(value: string): void {
    this.filterText.set(value);
    this.pageIndex.set(0);
  }
  
  onPageChange(index: number): void {
    this.pageIndex.set(index);
  }
}
