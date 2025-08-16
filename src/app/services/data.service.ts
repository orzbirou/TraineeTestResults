import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { TestResult } from '../models/trainee.types';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  loadResults(): Observable<TestResult[]> {
    return this.http.get<TestResult[]>('assets/mock.json').pipe(
      tap(rows => console.log('Loaded mock.json:', Array.isArray(rows) ? rows.length : 'n/a')),
      catchError(err => {
        console.error('Failed to load assets/mock.json', err);
        return of([] as TestResult[]);
      })
    );
  }
}
