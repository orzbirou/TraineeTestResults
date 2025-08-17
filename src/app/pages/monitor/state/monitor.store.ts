import { Injectable, computed, signal } from '@angular/core';
import { DataPageStore } from '../../data/state/data-page.store';

export interface TraineeSummary {
  traineeId: string;
  traineeName: string;
  exams: number;
  avg: number;        // 0..100, rounded to 2 decimals
  pass: number;
  fail: number;
  lastDate: string;   // YYYY-MM-DD
}

@Injectable({ providedIn: 'root' })
export class MonitorStore {
  // PASS is fixed per the spec
  private readonly PASS = 65;

  // Filters UI state
  readonly selectedIds = signal<string[]>([]);
  readonly nameText    = signal<string>('');     // set only via applyName()
  readonly showPassed  = signal<boolean>(true);
  readonly showFailed  = signal<boolean>(true);

  constructor(private data: DataPageStore) {}

  passThreshold(): number { return this.PASS; }

  // Source data from DataPageStore
  readonly results = computed(() => this.data.results());

  // For IDs multi-select
  readonly allIds = computed(() => {
    const set = new Set<string>();
    for (const r of this.results()) set.add(r.traineeId);
    return Array.from(set).sort();
  });

  applyName(text: string) {
    this.nameText.set((text ?? '').trim());
  }

  // Summaries per trainee (with filters applied)
  readonly summaries = computed<TraineeSummary[]>(() => {
    const rows = this.results();
    const by = new Map<string, { name: string; grades: number[]; dates: string[] }>();
    for (const r of rows) {
      const id = r.traineeId as string;
      if (!by.has(id)) by.set(id, { name: r.traineeName as string, grades: [], dates: [] });
      const e = by.get(id)!;
      e.grades.push(Number(r.grade ?? 0));
      e.dates.push(String(r.date ?? '').slice(0,10));
    }

    // build raw summaries
    let out: TraineeSummary[] = [];
    for (const [id, v] of by) {
      const exams = v.grades.length;
      const avgRaw = exams ? v.grades.reduce((a,b)=>a+b,0)/exams : 0;
      const pass = v.grades.filter(g => g >= this.PASS).length;
      const fail = exams - pass;
      const lastDate = v.dates.sort((a,b)=>a.localeCompare(b)).at(-1) ?? '';
      out.push({
        traineeId: id,
        traineeName: v.name,
        exams,
        avg: +avgRaw.toFixed(2),
        pass,
        fail,
        lastDate
      });
    }

    // apply filters
    const ids = this.selectedIds();
    const name = this.nameText().toLowerCase();
    const wantPassed = this.showPassed();
    const wantFailed = this.showFailed();

    out = out.filter(s => {
      if (ids.length && !ids.includes(s.traineeId)) return false;
      if (name && !s.traineeName.toLowerCase().includes(name)) return false;
      const isPassed = s.avg >= this.PASS;
      if (!wantPassed && isPassed) return false;
      if (!wantFailed && !isPassed) return false;
      return true;
    });

    // sort by avg desc, then name asc
    out.sort((a,b) => b.avg - a.avg || a.traineeName.localeCompare(b.traineeName));
    return out;
  });
}
