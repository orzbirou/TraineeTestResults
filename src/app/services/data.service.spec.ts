import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { TestResult } from '../models/trainee.types';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load test results from mock.json', () => {
    const mockData: TestResult[] = [
      {
        id: 'TR001',
        traineeId: 'T1',
        traineeName: 'Test User',
        subject: 'Math',
        grade: 90,
        date: '2025-02-15'
      }
    ];

    service.loadResults().subscribe(results => {
      expect(results).toEqual(mockData);
    });

    const req = httpMock.expectOne('/assets/mock.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
