import { TestBed } from '@angular/core/testing';
import { MonitorStore } from './monitor.store';
import { DataPageStore } from '../../data/state/data-page.store';

describe('MonitorStore', () => {
  let store: MonitorStore;
  let dataStore: DataPageStore;

  const mockResults = [
    { id: '1', traineeId: 'T001', traineeName: 'Alice', subject: 'Math', grade: 70, date: '2025-01-01' },
    { id: '2', traineeId: 'T001', traineeName: 'Alice', subject: 'Physics', grade: 60, date: '2025-01-02' },
    { id: '3', traineeId: 'T002', traineeName: 'Bob', subject: 'Math', grade: 80, date: '2025-01-03' },
    { id: '4', traineeId: 'T002', traineeName: 'Bob', subject: 'Physics', grade: 85, date: '2025-01-04' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MonitorStore, DataPageStore]
    });

    store = TestBed.inject(MonitorStore);
    dataStore = TestBed.inject(DataPageStore);

    // Mock the results in DataPageStore
    Object.defineProperty(dataStore, 'results', {
      get: () => () => mockResults
    });
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should calculate correct summaries without filters', () => {
    const summaries = store.summaries();
    expect(summaries.length).toBe(2);

    // Bob should be first (higher avg)
    expect(summaries[0]).toEqual({
      traineeId: 'T002',
      traineeName: 'Bob',
      exams: 2,
      avg: 82.5,
      pass: 2,
      fail: 0,
      lastDate: '2025-01-04'
    });

    // Alice should be second
    expect(summaries[1]).toEqual({
      traineeId: 'T001',
      traineeName: 'Alice',
      exams: 2,
      avg: 65,
      pass: 1,
      fail: 1,
      lastDate: '2025-01-02'
    });
  });

  it('should filter by selectedIds', () => {
    store.selectedIds.set(['T001']);
    const summaries = store.summaries();
    expect(summaries.length).toBe(1);
    expect(summaries[0].traineeId).toBe('T001');
  });

  it('should filter by selectedNames', () => {
    store.selectedNames.set(['Bob']);
    const summaries = store.summaries();
    expect(summaries.length).toBe(1);
    expect(summaries[0].traineeName).toBe('Bob');
  });

  it('should filter by name text', () => {
    store.applyName('ali');
    const summaries = store.summaries();
    expect(summaries.length).toBe(1);
    expect(summaries[0].traineeName).toBe('Alice');
  });

  it('should filter by pass/fail status', () => {
    // Show only passed
    store.showFailed.set(false);
    let summaries = store.summaries();
    expect(summaries.length).toBe(1);
    expect(summaries[0].traineeName).toBe('Bob');

    // Show only failed
    store.showPassed.set(false);
    store.showFailed.set(true);
    summaries = store.summaries();
    expect(summaries.length).toBe(1);
    expect(summaries[0].traineeName).toBe('Alice');
  });

  it('should combine multiple filters', () => {
    store.selectedIds.set(['T001', 'T002']);
    store.selectedNames.set(['Alice']);
    store.showFailed.set(false); // only passed

    const summaries = store.summaries();
    expect(summaries.length).toBe(0); // Alice has both pass and fail
  });

  it('should expose pass threshold', () => {
    expect(store.passThreshold()).toBe(65);
  });

  describe('computed getters', () => {
    it('should get all unique IDs', () => {
      const ids = store.allIds();
      expect(ids).toEqual(['T001', 'T002']);
    });

    it('should get all unique names', () => {
      const names = store.allNames();
      expect(names).toEqual(['Alice', 'Bob']);
    });
  });
});
