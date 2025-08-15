import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { DataPageStore } from '../state/data-page.store';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { Router, ActivatedRoute } from '@angular/router';
import { DetailsPanelComponent } from '../../details-panel/details-panel.component';
import { TestResult } from '../../../models/trainee.types';
@Component({
  selector: 'app-data-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatButtonModule,
    DetailsPanelComponent
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

  onAdd(): void {
    const r = this.store.addBlank();
  }

  onSave(updated: TestResult): void {
    this.store.save(updated);
  }

  onRemove(id: string): void {
    this.store.remove(id);
  }

  onCancel(): void {
    this.store.clearSelection();
  }
  
  constructor() {
    // Initialize store from URL params if present
    const qParam = this.route.snapshot.queryParamMap.get('q');
    const pParam = this.route.snapshot.queryParamMap.get('p');
    
    const initialParams: { filterText?: string; pageIndex?: number } = {};
    if (qParam !== null) {
      initialParams.filterText = qParam;
    }
    if (pParam !== null) {
      const parsedPage = this.parsePageParam(pParam);
      if (!isNaN(parsedPage)) {
        initialParams.pageIndex = parsedPage;
      }
    }
    
    // Hydrate store with initial URL params
    if (Object.keys(initialParams).length > 0) {
      this.store.hydrateFromUrl(initialParams);
    }

    // Load initial data if needed
    if (this.store.results().length === 0) {
      this.dataService.loadResults().subscribe(results => {
        this.store.setResults(results);
      });
    }

    // Subscribe to query param changes for browser back/forward navigation
    this.route.queryParamMap.subscribe(params => {
      const qParam = params.get('q');
      const pParam = params.get('p');
      
      const urlParams: { filterText?: string; pageIndex?: number } = {};
      
      // Only include params that are present and different from current values
      if (qParam !== null && qParam !== this.store.filterText()) {
        urlParams.filterText = qParam;
      }
      
      if (pParam !== null) {
        const parsedPage = this.parsePageParam(pParam);
        if (!isNaN(parsedPage) && parsedPage !== this.store.pageIndex()) {
          urlParams.pageIndex = parsedPage;
        }
      }

      // Hydrate store only if we have valid params
      if (Object.keys(urlParams).length > 0) {
        this.store.hydrateFromUrl(urlParams);
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
  onPageChange(index: number): void {
    this.store.setPage(index);
  }

  private parsePageParam(value: string | null): number {
    const parsed = parseInt(value || '', 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}
