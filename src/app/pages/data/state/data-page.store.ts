import { Injectable, computed, signal } from '@angular/core';
import { TestResult } from '../../../models/trainee.types';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';

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
  private _selectedRowId = signal<string | null>(null);

  // Exposed signals (read-only)
  readonly results = this._results.asReadonly();
  readonly filterText = this._filterText.asReadonly();
  readonly debouncedFilterText = this._debouncedFilterText.asReadonly();
  readonly pageIndex = this._pageIndex.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly selectedRowId = this._selectedRowId.asReadonly();

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

  readonly selectedRow = computed(() => {
    const id = this._selectedRowId();
    return id ? this._results().find(row => row.id === id) || null : null;
  });

  constructor() {
    // Setup debounced filter
    toObservable(this._filterText).pipe(
      startWith(this._filterText()),
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

  selectRow(id: string): void {
    this._selectedRowId.set(id);
  }

  clearSelection(): void {
    this._selectedRowId.set(null);
  }

  save(updated: TestResult): void {
    this._results.update(results => 
      results.map(row => row.id === updated.id ? updated : row)
    );
    this._selectedRowId.set(updated.id);
  }

  remove(id: string): void {
    this._results.update(results => 
      results.filter(row => row.id !== id)
    );
    this.clearSelection();
  }

  addBlank(): TestResult {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString();

    const newRow: TestResult = {
      id: newId,
      traineeId: '',
      traineeName: '',
      subject: '',
      grade: 0,
      date: today
    };

    this._results.update(results => [newRow, ...results]);
    this._selectedRowId.set(newId);
    return newRow;
  }

  hydrateFromUrl(params: { filterText?: string; pageIndex?: number }) {
    if (params.filterText !== undefined) {
      this._filterText.set(params.filterText);
      this._debouncedFilterText.set(params.filterText); // immediate, skip debounce flash
    }
    if (params.pageIndex !== undefined) {
      this._pageIndex.set(params.pageIndex);
    }
  }
}
