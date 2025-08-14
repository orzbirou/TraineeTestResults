import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
        MatToolbarModule,
        MatButtonModule,
        NoopAnimationsModule
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();

    // Query all anchor elements with routerLink attribute
    const links = fixture.nativeElement.querySelectorAll('a[routerLink]');
    expect(links.length).toBe(3);
    expect(links[0].getAttribute('routerLink')).toBe('/data');
    expect(links[1].getAttribute('routerLink')).toBe('/analysis');
    expect(links[2].getAttribute('routerLink')).toBe('/monitor');
  });
});