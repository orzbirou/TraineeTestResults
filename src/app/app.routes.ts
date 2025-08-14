import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'data',
    pathMatch: 'full'
  },
  {
    path: 'data',
    loadComponent: () => import('./pages/data/data-page.component')
      .then(m => m.DataPageComponent)
  },
  {
    path: 'analysis',
    loadComponent: () => import('./pages/analysis/analysis-page.component')
      .then(m => m.AnalysisPageComponent)
  },
  {
    path: 'monitor',
    loadComponent: () => import('./pages/monitor/monitor-page.component')
      .then(m => m.MonitorPageComponent)
  },
  {
    path: '**',
    redirectTo: 'data'
  }
];
