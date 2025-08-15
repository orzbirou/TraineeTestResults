import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { DataPageStore } from './state/data-page.store';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected store = inject(DataPageStore);
  
  // Table configuration
  displayedColumns = ['traineeName', 'subject', 'grade', 'date'];
  
  constructor() {
    // Initialize store with URL params if present
    const initialFilter = this.route.snapshot.queryParamMap.get('q') || '';
    const initialPage = this.parsePageParam(this.route.snapshot.queryParamMap.get('p'));
    
    this.store.setFilter(initialFilter);
    this.store.setPage(initialPage);

    // Load initial data if needed
    if (this.store.results().length === 0) {
      this.dataService.loadResults().subscribe(results => {
        this.store.setResults(results);
      });
    }

    // Subscribe to query param changes for browser back/forward navigation
    this.route.queryParamMap.subscribe(params => {
      const newFilter = params.get('q') ?? '';
      const newPage = this.parsePageParam(params.get('p'));
      
      // Only update if values actually changed to avoid feedback loops
      if (newFilter !== this.store.filterText()) {
        this.store.setFilter(newFilter);
      }
      if (newPage !== this.store.pageIndex()) {
        this.store.setPage(newPage);
      }
    });

    // Keep URL in sync with state
    effect(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { 
          q: this.store.filterText(), 
          p: this.store.pageIndex() 
        },
        replaceUrl: true
      });
    });
  }
  
  // Event handlers
  onFilterChange(value: string): void {
    this.store.setFilter(value);
    this.store.setPage(0);
  }
  
  onPageChange(index: number): void {
    this.store.setPage(index);
  }

  private parsePageParam(value: string | null): number {
    const parsed = parseInt(value || '', 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}
