import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalysisPageComponent } from './analysis-page.component';
import { AnalysisStore } from '../state/analysis.store';
import { DataPageStore } from '../../data/state/data-page.store';
import { Chart } from 'chart.js';
import { registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

describe('AnalysisPageComponent', () => {
  let component: AnalysisPageComponent;
  let fixture: ComponentFixture<AnalysisPageComponent>;
  let store: AnalysisStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisPageComponent],
      providers: [AnalysisStore, DataPageStore]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(AnalysisStore);

    // Mock store methods to return empty datasets
    spyOn(store, 'getChartConf').and.returnValue({
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Test', data: [] }] },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    // Set initial visible charts
    store.visibleLeft.set('chart1');
    store.visibleRight.set('chart2');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render filter controls', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-card.filters')).toBeTruthy();
    expect(compiled.querySelector('mat-form-field mat-label')).toBeTruthy();
  });

  it('should render charts', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('canvas[baseChart]').length).toBe(2);
    expect(compiled.querySelectorAll('mat-card-title')[0].textContent).toContain('Left:');
    expect(compiled.querySelectorAll('mat-card-title')[1].textContent).toContain('Right:');
  });

  describe('store interaction', () => {
    beforeEach(() => {
      // Reset store selections before each test
      store.setSelectedTrainees([]);
      store.setSelectedSubjects([]);
    });

    it('should handle trainee selection', () => {
      const traineeIds = ['T1', 'T2'];
      store.setSelectedTrainees(traineeIds);
      fixture.detectChanges();
      expect(store.selectedTraineeIds()).toEqual(traineeIds);
    });

    it('should handle subject selection', () => {
      const subjects = ['Math', 'Physics'];
      store.setSelectedSubjects(subjects);
      fixture.detectChanges();
      expect(store.selectedSubjects()).toEqual(subjects);
    });

    it('should update charts when selections change', () => {
      // Make a selection change
      store.setSelectedSubjects(['Math']);
      store.setSelectedTrainees(['T1']);
      fixture.detectChanges();

      // Verify that getChartConf was called for both visible charts
      expect(store.getChartConf).toHaveBeenCalledWith('chart1');
      expect(store.getChartConf).toHaveBeenCalledWith('chart2');
    });
  });
});
