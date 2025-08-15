import { Injectable, computed, signal } from '@angular/core';
import { TestResult } from '../models/trainee.types';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataPageStore {
  // State signals
  private _results = signal<TestResult[]>([]);
  private _filterText = signal('');
  private _debouncedFilterText = signal('');
  private _pageIndex = signal(0);
  private _pageSize = signal(10);

  // Exposed signals (read-only)
  readonly results = this._results.asReadonly();
  readonly filterText = this._filterText.asReadonly();
  readonly debouncedFilterText = this._debouncedFilterText.asReadonly();
  readonly pageIndex = this._pageIndex.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

  // Computed values
  readonly filtered = computed(() => {
    const filter = this._debouncedFilterText().toLowerCase();
    return this._results().filter(result =>
      result.traineeName.toLowerCase().includes(filter) ||
      result.subject.toLowerCase().includes(filter)
    );
  });

  readonly page = computed(() => {
    const start = this._pageIndex() * this._pageSize();
    const end = start + this._pageSize();
    return this.filtered().slice(start, end);
  });

  constructor() {
    // Setup debounced filter
    toObservable(this._filterText).pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this._debouncedFilterText.set(value);
    });
  }

  // State mutations
  setFilter(text: string): void {
    this._filterText.set(text);
    this._pageIndex.set(0);
  }

  setPage(index: number): void {
    this._pageIndex.set(index);
  }

  setResults(rows: TestResult[]): void {
    this._results.set(rows);
  }
}
