import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BaseChartDirective } from 'ng2-charts';
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
    BaseChartDirective
  ],
  templateUrl: './analysis-page.component.html',
  styleUrls: ['./analysis-page.component.scss']
})
export class AnalysisPageComponent {
  constructor(protected store: AnalysisStore) {}
}
