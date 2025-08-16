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
    // Create a fresh localStorage mock before each test
    const localStorageStore: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => localStorageStore[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => { localStorageStore[key] = value; });
    spyOn(localStorage, 'clear').and.callFake(() => { Object.keys(localStorageStore).forEach(key => delete localStorageStore[key]); });
    
    TestBed.configureTestingModule({
      providers: [DataPageStore]
    });
    store = TestBed.inject(DataPageStore);
    store.overwriteWith(mockData);
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
    store.overwriteWith(Array(15).fill(mockData[0]));
    store.setPage(1);
    expect(store.page().length).toBe(5); // Second page of 15 items with pageSize 10
  });

  it('should bootstrap from localStorage when data exists', () => {
    const testData = [...mockData, {
      id: 'TR003',
      traineeId: 'T3',
      traineeName: 'Bob Wilson',
      subject: 'Chemistry',
      grade: 95,
      date: '2025-01-03'
    }];
    
    localStorage.setItem(DataPageStore.LS_KEY, JSON.stringify(testData));

    // Create a new store instance and bootstrap
    const newStore = TestBed.inject(DataPageStore);
    const success = newStore.bootstrapFromLocal();
    
    expect(success).toBe(true);
    expect(newStore.results()).toEqual(testData);
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

  it('should clear all data and localStorage', () => {
    const localData = [...mockData, {
      id: 'TR003',
      traineeId: 'T3',
      traineeName: 'Bob Wilson',
      subject: 'Chemistry',
      grade: 95,
      date: '2025-01-03'
    }];
    
    // Set up some data first
    store.overwriteWith(localData);
    expect(store.results().length).toBe(3);
    
    // Clear everything
    store.clearAll();
    
    // Check state was cleared
    expect(store.results()).toEqual([]);
    expect(store.selectedRowId()).toBeNull();
    expect(localStorage.getItem(DataPageStore.LS_KEY)).toBeNull();
  });
});
