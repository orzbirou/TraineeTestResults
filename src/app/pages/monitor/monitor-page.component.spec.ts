import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonitorPageComponent } from './monitor-page.component';

describe('MonitorPageComponent', () => {
  let component: MonitorPageComponent;
  let fixture: ComponentFixture<MonitorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Monitor Page');
  });

  it('should render description', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p')?.textContent).toContain('This is the monitor page component');
  });
});
