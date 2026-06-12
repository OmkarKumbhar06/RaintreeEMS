import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { Employee } from '../../shared/models/models';

@Component({
  selector: 'app-reports',
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-chart-bar"></i> Employee Report</h1>
      <div class="flex gap-2" style="flex-wrap:wrap">
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input class="form-control" [(ngModel)]="search" placeholder="Search employees…">
        </div>
        <button class="btn btn-success" (click)="exportCSV()">
          <i class="fas fa-file-csv"></i> Export CSV
        </button>
      </div>
    </div>

    @if (loading) {
      <div class="text-center" style="padding:60px;color:var(--text-muted)">
        <span class="spinner spinner-dark" style="width:30px;height:30px;border-width:3px"></span>
        <p style="margin-top:12px">Loading report…</p>
      </div>
    }

    @for (dept of visibleDepts; track dept) {
      <div class="card dept-card">
        <div class="dept-header">
          <div class="dept-title">
            <div class="dept-icon"><i class="fas fa-building"></i></div>
            <span>{{ dept }}</span>
          </div>
          <div class="dept-meta">
            <span class="badge badge-active">{{ countInDept(dept) }} employee{{ countInDept(dept) !== 1 ? 's' : '' }}</span>
          </div>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr>
              <th>#</th><th>Code</th><th>Name</th><th>Designation</th>
              <th>Email</th><th>Mobile</th><th>Joining Date</th><th>Status</th>
            </tr></thead>
            <tbody>
              @for (e of matchingInDept(dept); track e.employeeCode; let i = $index) {
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td><strong>{{ e.employeeCode }}</strong></td>
                  <td>{{ e.employeeName }}</td>
                  <td>{{ e.designation }}</td>
                  <td>{{ e.email }}</td>
                  <td>{{ e.mobileNo }}</td>
                  <td>{{ formatDate(e.joiningDate) }}</td>
                  <td><span class="badge" [class]="e.status === 'Active' ? 'badge-active' : 'badge-inactive'">{{ e.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    @if (!loading && visibleDepts.length === 0) {
      <div class="card text-center" style="padding:60px;color:var(--text-muted)">
        <i class="fas fa-search" style="font-size:36px;display:block;margin-bottom:12px"></i>
        No results for "{{ search }}"
      </div>
    }
  `,
  styles: [`
    .dept-card     { margin-bottom: 20px; }
    .dept-header   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
    .dept-title    { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; }
    .dept-icon     { width: 34px; height: 34px; background: var(--primary-light); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .dept-meta     { display: flex; align-items: center; gap: 10px; }
  `]
})
export class ReportsComponent implements OnInit {
  private svc = inject(ReportService);

  allEmployees: Employee[] = [];
  grouped: Record<string, Employee[]> = {};
  loading = true;
  search  = '';

  ngOnInit() {
    this.svc.getEmployeeByDepartment().subscribe(data => {
      this.allEmployees = data;
      this.grouped      = data.reduce((acc: Record<string, Employee[]>, e) => {
        (acc[e.departmentName] ??= []).push(e); return acc;
      }, {});
      this.loading = false;
    });
  }

  get visibleDepts(): string[] {
    const s = this.search.toLowerCase();
    if (!s) return Object.keys(this.grouped);
    return Object.keys(this.grouped).filter(dept =>
      dept.toLowerCase().includes(s) ||
      this.grouped[dept].some(e => this.matchEmp(e, s))
    );
  }

  matchingInDept(dept: string): Employee[] {
    const s = this.search.toLowerCase();
    if (!s) return this.grouped[dept];
    return this.grouped[dept].filter(e => this.matchEmp(e, s));
  }

  countInDept(dept: string): number { return this.matchingInDept(dept).length; }

  private matchEmp(e: Employee, s: string): boolean {
    return e.employeeName.toLowerCase().includes(s) ||
           e.employeeCode.toLowerCase().includes(s) ||
           e.designation.toLowerCase().includes(s);
  }

  exportCSV() {
    const header = 'Department,Code,Name,Designation,Email,Mobile,Joining Date,Status';
    const rows   = this.allEmployees.map(e =>
      `"${e.departmentName}","${e.employeeCode}","${e.employeeName}","${e.designation}","${e.email}","${e.mobileNo}","${this.formatDate(e.joiningDate)}","${e.status}"`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href     = URL.createObjectURL(blob);
    link.download = `employee-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
