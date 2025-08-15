import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TestResult } from '../../models/trainee.types';

@Component({
  selector: 'app-details-panel',
  templateUrl: './details-panel.component.html',
  styleUrls: ['./details-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class DetailsPanelComponent implements OnInit {
  @Input() set row(value: TestResult | null) {
    if (value) {
      this.form.patchValue({
        traineeId: value.traineeId,
        traineeName: value.traineeName,
        subject: value.subject,
        grade: value.grade,
        date: value.date
      });
      this._currentId = value.id;
    } else {
      this.form.reset();
      this._currentId = null;
    }
  }

  @Output() save = new EventEmitter<TestResult>();
  @Output() remove = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  private _currentId: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      traineeId: ['', Validators.required],
      traineeName: ['', Validators.required],
      subject: ['', Validators.required],
      grade: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSave(): void {
    if (this.form.valid && this._currentId) {
      this.save.emit({
        ...this.form.value,
        id: this._currentId
      });
    }
  }

  onRemove(): void {
    if (this._currentId) {
      this.remove.emit(this._currentId);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
