import { Injectable, computed, signal } from '@angular/core';
import { TestResult } from '../../../models/trainee.types';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataPageStore {
  public static readonly LS_KEY = 'dataPage.results';

  // State signals
  private _results = signal<TestResult[]>([]);
  private _filterText = signal('');
  private _debouncedFilterText = signal('');
  private _pageIndex = signal(0);
  private _pageSize = signal(10);
  private _selectedRowId = signal<string | null>(null);
  private _draft = signal<TestResult | null>(null);

  // Exposed signals (read-only)
  readonly results = this._results.asReadonly();
  readonly filterText = this._filterText.asReadonly();
  readonly debouncedFilterText = this._debouncedFilterText.asReadonly();
  readonly pageIndex = this._pageIndex.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly selectedRowId = this._selectedRowId.asReadonly();
  readonly isCreating = computed(() => this._draft() !== null);

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
    const sel = this._selectedRowId();
    const draft = this._draft();
    if (draft && sel === draft.id) return draft;
    if (!sel) return null;
    return this._results().find(r => r.id === sel) ?? null;
  });

  constructor() {
    // Try to load initial results from localStorage
    try {
      const saved = localStorage.getItem(DataPageStore.LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as TestResult[];
        if (Array.isArray(parsed) && parsed.every(item => 
          typeof item === 'object' && 
          'id' in item && 
          'traineeName' in item && 
          'subject' in item
        )) {
          this._results.set(parsed);
        }
      }
    } catch {}

    // Setup debounced filter
    toObservable(this._filterText).pipe(
      startWith(this._filterText()),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this._debouncedFilterText.set(value);
    });

    // Save results to localStorage whenever they change
    toObservable(this._results).subscribe(value => {
      try {
        localStorage.setItem(DataPageStore.LS_KEY, JSON.stringify(value));
      } catch {}
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

  bootstrapFromLocal(): boolean {
    try {
      const raw = localStorage.getItem(DataPageStore.LS_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this._results.set(parsed);
        return parsed.length > 0;
      }
    } catch {}
    return false;
  }

  overwriteWith(rows: TestResult[]) {
    const arr = Array.isArray(rows) ? rows : [];
    this._results.set(arr);            // this will persist via the subscription above
    this._pageIndex.set(0);
  }

  clearAll() {
    this._results.set([]);
    this._selectedRowId.set(null);
    try { localStorage.removeItem(DataPageStore.LS_KEY); } catch {}
  }

  selectRow(id: string): void {
    this._selectedRowId.set(id);
  }

  clearSelection(): void {
    this._selectedRowId.set(null);
  }

  save(updated: TestResult): void {
    if (this.isCreating()) {
      this._draft.set(updated);
    } else {
      this._results.update(results => 
        results.map(row => row.id === updated.id ? updated : row)
      );
      this._selectedRowId.set(updated.id);
    }
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

  beginCreate(): void {
    const id = globalThis.crypto?.randomUUID?.() ?? Date.now().toString();
    const today = new Date().toISOString().slice(0, 10);
    
    this._draft.set({ id, traineeId: '', traineeName: '', subject: '', grade: 0, date: today });
    this._selectedRowId.set(id); // IMPORTANT: open the drawer by selecting the draft
  }

  commitCreate(): void {
    const draft = this._draft();
    if (draft) {
      this._results.update(results => [draft, ...results]);
      this._draft.set(null);
      this._selectedRowId.set(null);
    }
  }

  cancelCreate(): void {
    this._draft.set(null);
    this._selectedRowId.set(null);
  }
}
