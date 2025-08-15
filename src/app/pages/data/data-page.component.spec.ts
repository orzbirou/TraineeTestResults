import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataPageComponent } from './data-page.component';
import { DataService } from '../../services/data.service';
import { of } from 'rxjs';
import { TestResult } from '../../models/trainee.types';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DataPageStore } from './state/data-page.store';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterModule } from '@angular/router';

describe('DataPageComponent', () => {
  let component: DataPageComponent;
  let fixture: ComponentFixture<DataPageComponent>;
  let mockDataService: jasmine.SpyObj<DataService>;
  let store: DataPageStore;
  let mockRoute: Partial<ActivatedRoute>;

  const mockData: TestResult[] = [
    {
      id: 'TR001',
      traineeId: 'T1',
      traineeName: 'Test User',
      subject: 'Math',
      grade: 90,
      date: '2025-02-15'
    },
    {
      id: 'TR002',
      traineeId: 'T2',
      traineeName: 'Another User',
      subject: 'Physics',
      grade: 85,
      date: '2025-02-16'
    }
  ];

  beforeEach(async () => {
    mockDataService = jasmine.createSpyObj('DataService', ['loadResults']);
    mockDataService.loadResults.and.returnValue(of(mockData));

    const mockQueryParamMap = {
      get: () => null,
      getAll: () => [],
      has: () => false,
      keys: []
    };

    mockRoute = {
      snapshot: {} as ActivatedRouteSnapshot,
      queryParamMap: of(mockQueryParamMap)
    };

    await TestBed.configureTestingModule({
      imports: [DataPageComponent, NoopAnimationsModule, RouterModule],
      providers: [
        { provide: DataService, useValue: mockDataService },
        { provide: ActivatedRoute, useValue: mockRoute },
        DataPageStore
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DataPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(DataPageStore);
    store.setResults(mockData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all records initially', () => {
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);
  });

  it('should filter records by trainee name', () => {
    component.onFilterChange('Another');
    fixture.detectChanges();
    
    const filtered = store.filtered();
    expect(filtered.length).toBe(1);
    expect(filtered[0].traineeName).toBe('Another User');
  });

  it('should filter records by subject', () => {
    component.onFilterChange('physics');
    fixture.detectChanges();
    
    const filtered = store.filtered();
    expect(filtered.length).toBe(1);
    expect(filtered[0].subject).toBe('Physics');
  });

  it('should handle pagination', () => {
    // Update page size and navigate to second page
    component.onPageChange(1);
    fixture.detectChanges();
    
    const page = store.page();
    expect(page.length).toBeGreaterThan(0);
  });
});
