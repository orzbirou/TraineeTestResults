import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalysisPageComponent } from './analysis-page.component';

describe('AnalysisPageComponent', () => {
  let component: AnalysisPageComponent;
  let fixture: ComponentFixture<AnalysisPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Analysis Page');
  });

  it('should render description', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p')?.textContent).toContain('This is the analysis page component');
  });
});
