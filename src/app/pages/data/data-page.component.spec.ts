import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataPageComponent } from './data-page.component';
import { DataService } from '../../services/data.service';
import { of } from 'rxjs';
import { TestResult } from '../../models/trainee.types';

describe('DataPageComponent', () => {
  let component: DataPageComponent;
  let fixture: ComponentFixture<DataPageComponent>;
  let mockDataService: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    mockDataService = jasmine.createSpyObj('DataService', ['loadResults']);
    mockDataService.loadResults.and.returnValue(of([
      {
        id: 'TR001',
        traineeId: 'T1',
        traineeName: 'Test User',
        subject: 'Math',
        grade: 90,
        date: '2025-02-15'
      }
    ]));

    await TestBed.configureTestingModule({
      imports: [DataPageComponent],
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

  it('should render number of loaded records', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p')?.textContent).toContain('Loaded 1 records');
  });
});
