import { Injectable, computed, signal } from '@angular/core';
import { DataPageStore } from '../../data/state/data-page.store';
import type { ChartConfiguration, ChartOptions } from 'chart.js';

@Injectable({ providedIn: 'root' })
export class AnalysisStore {
  constructor(private dataPageStore: DataPageStore) {}

  // Source data
  readonly results = computed(() => this.dataPageStore.results());

  // Unique trainees as objects {id, name} to match the template
  readonly uniqueTraineeIds = computed(() => {
    const map = new Map<string, string>();
    for (const r of this.results()) {
      if (!map.has(r.traineeId)) map.set(r.traineeId, r.traineeName);
    }
    return Array.from(map, ([id, name]) => ({ id, name }));
  });

  // Unique subjects (sorted)
  readonly uniqueSubjects = computed(() => {
    const set = new Set<string>();
    for (const r of this.results()) set.add(r.subject);
    return Array.from(set).sort();
  });

  // UI selections
  private _selectedTraineeIds = signal<string[]>([]);
  private _selectedSubjects = signal<string[]>([]);
  readonly selectedTraineeIds = this._selectedTraineeIds.asReadonly();
  readonly selectedSubjects   = this._selectedSubjects.asReadonly();

  setSelectedTrainees(ids: string[]) { this._selectedTraineeIds.set(ids ?? []); }
  setSelectedSubjects(subs: string[]) { this._selectedSubjects.set(subs ?? []); }

  // Filtered data (by traineeId and/or subject)
  readonly filteredResults = computed(() => {
    const ids  = this._selectedTraineeIds();
    const subs = this._selectedSubjects();
    let arr = this.results();
    if (ids.length)  arr = arr.filter(r => ids.includes(r.traineeId));
    if (subs.length) arr = arr.filter(r => subs.includes(r.subject));
    return arr.slice();
  });

  // Helper for display names
  traineeNameFor(id: string): string | null {
    const t = this.results().find(r => r.traineeId === id);
    return t ? t.traineeName : null;
  }

  // ---- Chart data builders ----

  // Bar: average grade per subject
  barData(): ChartConfiguration<'bar'>['data'] {
    const arr = this.filteredResults();
    const subjects = Array.from(new Set(arr.map(r => r.subject))).sort();
    const means = subjects.map(s => {
      const rows = arr.filter(r => r.subject === s);
      const sum = rows.reduce((acc, r) => acc + Number(r.grade || 0), 0);
      return rows.length ? +(sum / rows.length).toFixed(2) : 0;
    });
    // console.log('bar subjects', subjects, 'means', means);
    return {
      labels: subjects,
      datasets: [{ label: 'Average by subject', data: means }]
    };
  }

  barOptions(): ChartOptions<'bar'> {
    return { responsive: true, scales: { y: { beginAtZero: true } } };
  }

  // Line: progress over time per trainee
  lineData(): ChartConfiguration<'line'>['data'] {
    const arr = this.filteredResults();

    // Collect unique dates (YYYY-MM-DD) and sort
    const dates = Array.from(new Set(arr.map(r => (r.date ?? '').slice(0, 10)))).sort();

    // Build per-trainee map: date -> aggregated grade (avg if multiple in same day)
    const byId = new Map<string, { name: string; perDate: Map<string, { sum: number; n: number }> }>();
    for (const r of arr) {
      const id = r.traineeId;
      const name = r.traineeName;
      const d = (r.date ?? '').slice(0, 10);
      const g = Number(r.grade ?? 0);
      if (!byId.has(id)) byId.set(id, { name, perDate: new Map() });
      const pd = byId.get(id)!.perDate;
      const curr = pd.get(d) ?? { sum: 0, n: 0 };
      curr.sum += g; curr.n += 1;
      pd.set(d, curr);
    }

    // Choose which trainees to plot (selected or top-2 by points)
    let ids = this.selectedTraineeIds();
    if (!ids.length) {
      ids = Array.from(byId.entries())
        .sort((a,b) => a[1].perDate.size < b[1].perDate.size ? 1 : -1)
        .slice(0, 2)
        .map(([id]) => id);
    }

    // Build datasets aligned to labels
    const datasets = ids
      .filter(id => byId.has(id))
      .map(id => {
        const { name, perDate } = byId.get(id)!;
        const data = dates.map(d => {
          const agg = perDate.get(d);
          return agg ? +(agg.sum / agg.n).toFixed(2) : null; // null = gap
        });
        return {
          label: name || id,
          data,
          spanGaps: true
        };
      });

    return { labels: dates, datasets };
  }

  lineOptions(): ChartOptions<'line'> {
    return {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    };
  }
}
