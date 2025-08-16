import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
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
export class DetailsPanelComponent implements OnChanges {
  @Input() row: TestResult | null = null;

  @Output() save = new EventEmitter<TestResult>();
  @Output() remove = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() validity = new EventEmitter<boolean>();

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

    this.form.statusChanges.subscribe(() => {
      this.validity.emit(this.form.valid);
    });
  }

  ngOnInit(): void {}

  ngOnChanges() {
    if (this.row) {
      this.form.patchValue({
        traineeId: this.row.traineeId,
        traineeName: this.row.traineeName,
        subject: this.row.subject,
        grade: this.row.grade,
        date: this.row.date
      }, { emitEvent: true });
    } else {
      this.form.reset({ traineeId:'', traineeName:'', subject:'', grade:0, date:'' }, { emitEvent: true });
    }
  }

  onSaveClick() {
    const raw = this.form.getRawValue(); // includes disabled controls if any
    const updated: TestResult = {
      id: this.row?.id ?? raw['id'] ?? (globalThis.crypto?.randomUUID?.() ?? Date.now().toString()),
      traineeId: (raw['traineeId'] ?? '').toString().trim(),
      traineeName: (raw['traineeName'] ?? '').toString().trim(),
      subject: (raw['subject'] ?? '').toString().trim(),
      grade: Number(raw['grade'] ?? 0),
      date: (raw['date'] ?? '').toString()
    };
    this.save.emit(updated);
  }

  onRemove(): void {
    if (this.row?.id) {
      this.remove.emit(this.row.id);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
