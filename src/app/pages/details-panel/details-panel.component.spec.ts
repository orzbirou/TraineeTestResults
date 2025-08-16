import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsPanelComponent } from './details-panel.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestResult } from '../../models/trainee.types';

describe('DetailsPanelComponent', () => {
  let component: DetailsPanelComponent;
  let fixture: ComponentFixture<DetailsPanelComponent>;

  const mockTestResult: TestResult = {
    id: 'TEST-1',
    traineeId: 'T1  ', // extra spaces to test trimming
    traineeName: '  John Doe  ', // extra spaces to test trimming
    subject: ' Math ', // extra spaces to test trimming
    grade: 85,
    date: '2025-08-15'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsPanelComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.form.get('traineeId')?.value).toBe('');
    expect(component.form.get('traineeName')?.value).toBe('');
    expect(component.form.get('subject')?.value).toBe('');
    expect(component.form.get('grade')?.value).toBe('');
    expect(component.form.get('date')?.value).toBe('');
    expect(component.form.valid).toBeFalse();
  });

  it('should patch form when ngOnChanges is called with row', () => {
    component.row = mockTestResult;
    component.ngOnChanges();

    expect(component.form.get('traineeId')?.value).toBe(mockTestResult.traineeId);
    expect(component.form.get('traineeName')?.value).toBe(mockTestResult.traineeName);
    expect(component.form.get('subject')?.value).toBe(mockTestResult.subject);
    expect(component.form.get('grade')?.value).toBe(mockTestResult.grade);
    expect(component.form.get('date')?.value).toBe(mockTestResult.date);
  });

  it('should clear form when ngOnChanges is called with null row', () => {
    // First set some data
    component.row = mockTestResult;
    component.ngOnChanges();

    // Then clear it
    component.row = null;
    component.ngOnChanges();

    expect(component.form.get('traineeId')?.value).toBe('');
    expect(component.form.get('traineeName')?.value).toBe('');
    expect(component.form.get('subject')?.value).toBe('');
    expect(component.form.get('grade')?.value).toBe(0);
    expect(component.form.get('date')?.value).toBe('');
  });

  it('should emit save event with complete test result when form is valid', () => {
    const saveSpy = jasmine.createSpy('save');
    component.save.subscribe(saveSpy);

    component.row = mockTestResult;
    component.ngOnChanges();

    component.onSaveClick();
    
    expect(saveSpy).toHaveBeenCalledWith({
      ...mockTestResult,
      traineeId: mockTestResult.traineeId.trim(),
      traineeName: mockTestResult.traineeName.trim(),
      subject: mockTestResult.subject.trim(),
      grade: mockTestResult.grade
    });
  });

  it('should emit remove event with correct id', () => {
    const removeSpy = jasmine.createSpy('remove');
    component.remove.subscribe(removeSpy);

    component.row = mockTestResult;
    component.ngOnChanges();

    component.onRemove();
    expect(removeSpy).toHaveBeenCalledWith(mockTestResult.id);
  });

  it('should emit cancel event', () => {
    const cancelSpy = jasmine.createSpy('cancel');
    component.cancel.subscribe(cancelSpy);

    component.onCancel();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should validate grade range', () => {
    component.row = mockTestResult;
    component.ngOnChanges();

    component.form.patchValue({ grade: 101 });
    expect(component.form.get('grade')?.errors?.['max']).toBeTruthy();

    component.form.patchValue({ grade: -1 });
    expect(component.form.get('grade')?.errors?.['min']).toBeTruthy();

    component.form.patchValue({ grade: 100 });
    expect(component.form.get('grade')?.errors).toBeNull();

    component.form.patchValue({ grade: 0 });
    expect(component.form.get('grade')?.errors).toBeNull();
  });
});
