import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataPageComponent } from './data-page.component';
import { DataService } from '../../services/data.service';
import { of } from 'rxjs';
import { TestResult } from '../../models/trainee.types';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DataPageComponent', () => {
  let component: DataPageComponent;
  let fixture: ComponentFixture<DataPageComponent>;
  let mockDataService: jasmine.SpyObj<DataService>;

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

    await TestBed.configureTestingModule({
      imports: [DataPageComponent, NoopAnimationsModule],
      providers: [
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DataPageComponent);
    component = fixture.componentInstance;
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
    
    const filtered = component.filtered();
    expect(filtered.length).toBe(1);
    expect(filtered[0].traineeName).toBe('Another User');
  });

  it('should filter records by subject', () => {
    component.onFilterChange('physics');
    fixture.detectChanges();
    
    const filtered = component.filtered();
    expect(filtered.length).toBe(1);
    expect(filtered[0].subject).toBe('Physics');
  });

  it('should handle pagination', () => {
    component.pageSize.set(1);
    component.onPageChange(1);
    fixture.detectChanges();
    
    const page = component.page();
    expect(page.length).toBe(1);
    expect(page[0].id).toBe('TR002');
  });
});
