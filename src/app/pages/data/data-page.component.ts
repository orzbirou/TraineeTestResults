import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../services/data.service';
import { TestResult } from '../../models/trainee.types';

@Component({
  selector: 'app-data-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="data-container">
      <h1>Data Page</h1>
      <p>Loaded {{ results().length }} records</p>
    </div>
  `,
  styleUrls: ['./data-page.component.scss']
})
export class DataPageComponent {
  private dataService = inject(DataService);
  results = toSignal(this.dataService.loadResults(), { initialValue: [] as TestResult[] });
}
