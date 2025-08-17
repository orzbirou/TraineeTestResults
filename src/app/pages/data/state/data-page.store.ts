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

  // Combined results including draft if present
  readonly combined = computed(() => {
    const d = this._draft();
    const base = this._results();
    return d ? [d, ...base] : base;
  });

  // Parse filter tokens into predicates
  private parseFilterToken(token: string): (result: TestResult) => boolean {
    token = token.trim().toLowerCase();
    if (!token) return () => true;

    // Key:value format
    const kvMatch = token.match(/^([a-z]+):(.+)$/);
    if (kvMatch) {
      const [_, key, value] = kvMatch;
      
      // Handle different key types
      switch (key) {
        case 'id':
        case 'i':
          return (r) => r.traineeId.toLowerCase().includes(value);
          
        case 'name':
        case 'n':
          return (r) => r.traineeName.toLowerCase().includes(value);
          
        case 'subject':
        case 's':
          return (r) => r.subject.toLowerCase().includes(value);
          
        case 'grade':
        case 'g':
          // Handle grade ranges and comparisons
          const rangeMatch = value.match(/^(\d+)-(\d+)$/);
          if (rangeMatch) {
            const [_, min, max] = rangeMatch;
            return (r) => {
              const g = Number(r.grade);
              return g >= Number(min) && g <= Number(max);
            };
          }
          
          const compareMatch = value.match(/^([<>])(\d+)$/);
          if (compareMatch) {
            const [_, op, val] = compareMatch;
            const num = Number(val);
            return (r) => {
              const g = Number(r.grade);
              return op === '>' ? g > num : g < num;
            };
          }
          
          return (r) => Number(r.grade) === Number(value);
          
        case 'date':
        case 'd':
          // Handle date ranges and comparisons
          const dateRangeMatch = value.match(/^(.+?)[..-](.+)$/);
          if (dateRangeMatch) {
            const [_, start, end] = dateRangeMatch;
            return (r) => {
              const d = r.date || '';
              return d >= start && d <= end;
            };
          }
          
          const dateCompareMatch = value.match(/^([<>])(.+)$/);
          if (dateCompareMatch) {
            const [_, op, date] = dateCompareMatch;
            return (r) => {
              const d = r.date || '';
              return op === '>' ? d > date : d < date;
            };
          }
          
          return (r) => (r.date || '').includes(value);
      }
    }
    
    // Plain text: match traineeId OR name OR subject
    return (r) => 
      r.traineeId.toLowerCase().includes(token) ||
      r.traineeName.toLowerCase().includes(token) ||
      r.subject.toLowerCase().includes(token);
  }

  // Computed values
  readonly filtered = computed(() => {
    const text = this._debouncedFilterText();
    if (!text.trim()) return this.combined();
    
    // Split by whitespace, but keep quoted strings together
    const tokens = text.match(/\S+|"[^"]+"/g) || [];
    
    // Build array of predicates (one per token)
    const predicates = tokens.map(t => 
      t.startsWith('"') ? this.parseFilterToken(t.slice(1,-1)) : this.parseFilterToken(t)
    );
    
    // Apply all predicates (AND)
    return this.combined().filter(result => 
      predicates.every(pred => pred(result))
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
