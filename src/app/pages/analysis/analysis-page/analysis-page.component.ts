import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BaseChartDirective } from 'ng2-charts';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { AnalysisStore } from '../state/analysis.store';

@Component({
  selector: 'app-analysis-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    BaseChartDirective,
    DragDropModule
  ],
  templateUrl: './analysis-page.component.html',
  styleUrls: ['./analysis-page.component.scss']
})
export class AnalysisPageComponent {
  constructor(protected store: AnalysisStore) {}

  onDropToLeft(ev: CdkDragDrop<any>) {
    const key = ev.item.data as 'chart1'|'chart2'|'chart3';
    this.store.visibleLeft.set(key);
    // do NOT move arrays; we want the button to stay in the hidden list
  }

  onDropToRight(ev: CdkDragDrop<any>) {
    const key = ev.item.data as 'chart1'|'chart2'|'chart3';
    this.store.visibleRight.set(key);
  }

  chartTitle(key: 'chart1'|'chart2'|'chart3'): string {
    switch (key) {
      case 'chart1': return 'Average per Trainee';
      case 'chart2': return 'Progress Over Time';
      case 'chart3': return 'Average by Subject';
      default: return String(key);
    }
  }
}
