import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DataService } from '../../../services/data.service';
import { of } from 'rxjs';
import { TestResult } from '../../../models/trainee.types';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DataPageStore } from '../state/data-page.store';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterModule } from '@angular/router';
import { DataPageComponent } from './data-page.component';

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
      snapshot: {
        queryParamMap: mockQueryParamMap,
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        data: {},
        outlet: 'primary',
        component: null,
        routeConfig: null,
        children: [],
        pathFromRoot: [],
        paramMap: mockQueryParamMap
      } as unknown as ActivatedRouteSnapshot,
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

    // Create a fresh localStorage mock before each test
    const localStorageStore: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => localStorageStore[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => { localStorageStore[key] = value; });
    spyOn(localStorage, 'clear').and.callFake(() => { Object.keys(localStorageStore).forEach(key => delete localStorageStore[key]); });
    
    fixture = TestBed.createComponent(DataPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(DataPageStore);
    store.overwriteWith(mockData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all records initially', () => {
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);
  });

  it('should handle pagination', fakeAsync(() => {
    // Wait for initial data load
    tick();
    fixture.detectChanges();

    store.overwriteWith(Array(15).fill(mockData[0])); // Ensure we have enough data to paginate
    component.onPageChange(1);
    
    // Wait for any async operations
    tick();
    fixture.detectChanges();
    
    const page = store.page();
    expect(page.length).toBe(5); // Second page of 15 items with pageSize 10
  }));

  it('should load data from localStorage if available', fakeAsync(() => {
    const localData = [...mockData, {
      id: 'TR003',
      traineeId: 'T3',
      traineeName: 'Local User',
      subject: 'Chemistry',
      grade: 95,
      date: '2025-02-17'
    }];
    
    // Set localStorage data before creating component
    localStorage.setItem('dataPage.results', JSON.stringify(localData));
    
    // Create new instance to trigger localStorage load
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DataPageComponent, NoopAnimationsModule, RouterModule],
      providers: [
        { provide: DataService, useValue: mockDataService },
        { provide: ActivatedRoute, useValue: mockRoute },
        DataPageStore
      ]
    });
    
    fixture = TestBed.createComponent(DataPageComponent);
    component = fixture.componentInstance;
    
    // Wait for async operations
    tick();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(3); // Should show localStorage data
  }));

  it('should start empty when localStorage is empty', fakeAsync(() => {
    localStorage.clear();
    
    // Create new instance to ensure fresh state
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DataPageComponent, NoopAnimationsModule, RouterModule],
      providers: [
        { provide: DataService, useValue: mockDataService },
        { provide: ActivatedRoute, useValue: mockRoute },
        DataPageStore
      ]
    });
    
    fixture = TestBed.createComponent(DataPageComponent);
    component = fixture.componentInstance;
    
    // Wait for async operations
    tick();
    fixture.detectChanges();
    
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(0); // Should start empty
  }));

  it('should load server data when clicking Restore from JSON', fakeAsync(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(DataPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Click restore button
    component.onRestoreFromJson();
    tick();
    fixture.detectChanges();

    expect(mockDataService.loadResults).toHaveBeenCalled();
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2); // Should show server data after restore
  }));

  it('should clear data when clicking Clear data', fakeAsync(() => {
    fixture = TestBed.createComponent(DataPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(DataPageStore);
    store.overwriteWith(mockData);
    fixture.detectChanges();

    // Verify we have data initially
    let rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);

    // Click clear button
    component.onClearAll();
    fixture.detectChanges();

    rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(0); // Should be empty after clear
    expect(localStorage.getItem(DataPageStore.LS_KEY)).toBeNull(); // Should clear localStorage
  }));
});
