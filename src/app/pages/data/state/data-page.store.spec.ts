import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TestResult } from '../../../models/trainee.types';
import { DataPageStore } from './data-page.store';

describe('DataPageStore', () => {
  let store: DataPageStore;
  
  const mockData: TestResult[] = [
    {
      id: 'TR001',
      traineeId: 'T1',
      traineeName: 'John Smith',
      subject: 'Math',
      grade: 90,
      date: '2025-01-01'
    },
    {
      id: 'TR002',
      traineeId: 'T2',
      traineeName: 'Jane Doe',
      subject: 'Physics',
      grade: 85,
      date: '2025-01-02'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataPageStore]
    });
    store = TestBed.inject(DataPageStore);
    store.setResults(mockData);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(store.results()).toEqual(mockData);
    expect(store.filterText()).toBe('');
    expect(store.debouncedFilterText()).toBe('');
    expect(store.pageIndex()).toBe(0);
    expect(store.pageSize()).toBe(10);
  });

  it('should reset page index when filter changes', () => {
    store.setPage(1);
    expect(store.pageIndex()).toBe(1);
    store.setFilter('test');
    expect(store.pageIndex()).toBe(0);
  });

  it('should paginate results', () => {
    store.setResults(Array(15).fill(mockData[0]));
    store.setPage(1);
    expect(store.page().length).toBe(5); // Second page of 15 items with pageSize 10
  });

  it('should hydrate from URL params', fakeAsync(() => {
    store.hydrateFromUrl({ filterText: 'test', pageIndex: 2 });
    expect(store.filterText()).toBe('test');
    expect(store.debouncedFilterText()).toBe('test');
    expect(store.pageIndex()).toBe(2);

    store.hydrateFromUrl({ filterText: 'new' });
    expect(store.filterText()).toBe('new');
    expect(store.debouncedFilterText()).toBe('new');
    expect(store.pageIndex()).toBe(2); // Should not change

    store.hydrateFromUrl({ pageIndex: 1 });
    expect(store.filterText()).toBe('new'); // Should not change
    expect(store.pageIndex()).toBe(1);
  }));
});
