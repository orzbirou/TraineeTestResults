import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatToolbarModule, RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Trainees</span>
      <div style="margin-left: 20px;">
        <a mat-button routerLink="/data" routerLinkActive="active" [queryParamsHandling]="'preserve'">Data</a>
        <a mat-button routerLink="/analysis" routerLinkActive="active" [queryParamsHandling]="'preserve'">Analysis</a>
        <a mat-button routerLink="/monitor" routerLinkActive="active" [queryParamsHandling]="'preserve'">Monitor</a>
      </div>
    </mat-toolbar>

    <div style="padding:20px">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}
