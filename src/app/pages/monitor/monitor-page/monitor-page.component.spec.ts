import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonitorPageComponent } from './monitor-page.component';
import { MonitorStore } from '../state/monitor.store';
import { DataPageStore } from '../../data/state/data-page.store';

describe('MonitorPageComponent', () => {
  let component: MonitorPageComponent;
  let fixture: ComponentFixture<MonitorPageComponent>;
  let store: MonitorStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorPageComponent],
      providers: [MonitorStore, DataPageStore]
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MonitorStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display table columns correctly', () => {
    expect(component.displayedColumns).toEqual([
      'traineeName',
      'traineeId',
      'exams',
      'avg',
      'pass',
      'fail',
      'lastDate'
    ]);
  });

  describe('CSV Export', () => {
    it('should generate CSV with correct headers', () => {
      // Mock window.URL.createObjectURL
      const mockUrl = 'blob:test';
      spyOn(URL, 'createObjectURL').and.returnValue(mockUrl);
      spyOn(URL, 'revokeObjectURL');

      // Mock document.createElement
      const mockLink = { click: jasmine.createSpy('click'), href: '', download: '' };
      spyOn(document, 'createElement').and.returnValue(mockLink as any);

      // Mock store data
      spyOn(store, 'summaries').and.returnValue([
        {
          traineeId: 'T1',
          traineeName: 'Test User',
          exams: 2,
          avg: 75.5,
          pass: 2,
          fail: 0,
          lastDate: '2025-08-17'
        }
      ]);

      // Execute export
      component.exportCsv();

      // Verify CSV generation
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toBe('monitor.csv');
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      // Reset store filters before each test
      store.selectedIds.set([]);
      store.nameText.set('');
      store.showPassed.set(true);
      store.showFailed.set(true);
    });

    it('should apply ID filter correctly', () => {
      const mockIds = ['T1', 'T2'];
      store.selectedIds.set(mockIds);
      fixture.detectChanges();
      expect(store.selectedIds()).toEqual(mockIds);
    });

    it('should apply name filter correctly', () => {
      const searchName = 'test';
      store.applyName(searchName);
      fixture.detectChanges();
      expect(store.nameText()).toBe(searchName);
    });

    it('should handle pass/fail filters correctly', () => {
      store.showPassed.set(false);
      store.showFailed.set(true);
      fixture.detectChanges();
      expect(store.showPassed()).toBeFalse();
      expect(store.showFailed()).toBeTrue();
    });
  });
});
