import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatToolbarModule, RouterLink, RouterOutlet, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Trainees</span>
      <div style="margin-left: 20px;">
        <a mat-button routerLink="/data">Data</a>
        <a mat-button routerLink="/analysis">Analysis</a>
        <a mat-button routerLink="/monitor">Monitor</a>
      </div>
    </mat-toolbar>

    <div style="padding:20px">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}
