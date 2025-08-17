import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MonitorStore } from '../state/monitor.store';

@Component({
  selector: 'app-monitor-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatTableModule, MatCheckboxModule, MatSelectModule
  ],
  templateUrl: './monitor-page.component.html',
  styleUrls: ['./monitor-page.component.scss']
})
export class MonitorPageComponent {
  displayedColumns = ['traineeName','traineeId','exams','avg','pass','fail','lastDate'];
  constructor(public store: MonitorStore) {}

  exportCsv() {
    const rows = this.store.summaries();
    const header = ['Name','ID','Exams','Avg','Pass','Fail','Last Date'];
    const csv = [header.join(',')].concat(
      rows.map(r => [r.traineeName, r.traineeId, r.exams, r.avg, r.pass, r.fail, r.lastDate].join(','))
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'monitor.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
