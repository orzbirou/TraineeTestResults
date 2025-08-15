import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestResult } from '../models/trainee.types';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  loadResults(): Observable<TestResult[]> {
    return this.http.get<TestResult[]>('/assets/mock.json');
  }
}
