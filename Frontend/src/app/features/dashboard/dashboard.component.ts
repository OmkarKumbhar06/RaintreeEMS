import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats, Employee } from '../../shared/models/models';

@Component({
  selector: 'app-dashboard',
  imports: [],
  template: `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-tachometer-alt"></i> Dashboard</h1>
    </div>

    <!-- Stat Cards -->
    @if (stats) {
      <div class="stats-grid">
        @for (card of statCards; track card.label) {
          <div class="stat-card" [class.clickable]="card.status" [class.selected]="drillStatus === card.status"
               (click)="card.status && drillDown(card.status)">
            <div class="stat-icon" [style.background]="card.iconBg" [style.color]="card.iconColor">
              <i [class]="'fas ' + card.icon"></i>
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
              @if (card.status) {
                <div class="stat-hint">Click to view <i class="fas fa-arrow-right"></i></div>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- Drill-down table -->
    @if (drillStatus && drillEmployees.length >= 0) {
      <div class="card mt-3">
        <div class="drill-header">
          <h3>
            <i class="fas fa-users"></i>
            {{ drillLabel }} Employees
            <span class="badge badge-active" style="margin-left:8px">{{ drillEmployees.length }}</span>
          </h3>
          <button class="btn btn-outline btn-sm" (click)="clearDrill()">
            <i class="fas fa-times"></i> Close
          </button>
        </div>
        @if (drillLoading) {
          <div class="text-center" style="padding:30px;color:var(--text-muted)">
            <span class="spinner spinner-dark"></span> Loading…
          </div>
        } @else {
          <div class="table-wrap">
            <table class="table">
              <thead><tr>
                <th>#</th><th>Code</th><th>Name</th>
                <th>Department</th><th>Designation</th><th>Mobile</th><th>Status</th>
              </tr></thead>
              <tbody>
                @for (e of drillEmployees; track e.employeeId; let i = $index) {
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td><strong>{{ e.employeeCode }}</strong></td>
                    <td>{{ e.employeeName }}</td>
                    <td>{{ e.departmentName }}</td>
                    <td>{{ e.designation }}</td>
                    <td>{{ e.mobileNo }}</td>
                    <td><span class="badge" [class]="e.status === 'Active' ? 'badge-active' : 'badge-inactive'">{{ e.status }}</span></td>
                  </tr>
                }
                @if (drillEmployees.length === 0) {
                  <tr><td colspan="7" class="text-center" style="padding:30px;color:var(--text-muted)">No employees</td></tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
    .stat-card  {
      background: #fff; border-radius: 12px; padding: 22px;
      display: flex; align-items: center; gap: 18px;
      box-shadow: var(--shadow); transition: all .2s; border: 2px solid transparent;
    }
    .stat-card.clickable { cursor: pointer; }
    .stat-card.clickable:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,.13); }
    .stat-card.selected  { border-color: var(--primary); }
    .stat-icon  { width: 54px; height: 54px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
    .stat-value { font-size: 30px; font-weight: 800; line-height: 1; }
    .stat-label { color: var(--text-muted); font-size: 13px; margin-top: 4px; }
    .stat-hint  { font-size: 11px; color: var(--primary); margin-top: 5px; display: flex; align-items: center; gap: 4px; }
    .drill-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .drill-header h3 { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  `]
})
export class DashboardComponent implements OnInit {
  private svc = inject(DashboardService);

  stats: DashboardStats | null = null;
  statCards: any[] = [];
  drillStatus: string | null = null;
  drillLabel  = '';
  drillEmployees: Employee[] = [];
  drillLoading = false;

  ngOnInit() {
    this.svc.getStats().subscribe(s => {
      this.stats = s;
      this.statCards = [
        { label: 'Total Employees',    value: s.totalEmployees,    icon: 'fa-users',      iconBg: '#dbeafe', iconColor: '#1d4ed8', status: 'All'      },
        { label: 'Active Employees',   value: s.activeEmployees,   icon: 'fa-user-check', iconBg: '#dcfce7', iconColor: '#15803d', status: 'Active'   },
        { label: 'Inactive Employees', value: s.inactiveEmployees, icon: 'fa-user-times', iconBg: '#fee2e2', iconColor: '#b91c1c', status: 'Inactive' },
        { label: 'Total Departments',  value: s.totalDepartments,  icon: 'fa-sitemap',    iconBg: '#ede9fe', iconColor: '#6d28d9', status: null       },
      ];
    });
  }

  drillDown(status: string) {
    if (this.drillStatus === status) { this.clearDrill(); return; }
    this.drillStatus = status;
    this.drillLabel  = status === 'All' ? 'All' : status;
    this.drillLoading = true;
    this.drillEmployees = [];

    if (status === 'All') {
      this.svc.getEmployeesByStatus('Active').subscribe(active => {
        this.svc.getEmployeesByStatus('Inactive').subscribe(inactive => {
          this.drillEmployees = [...active, ...inactive].sort((a, b) => a.employeeName.localeCompare(b.employeeName));
          this.drillLoading = false;
        });
      });
    } else {
      this.svc.getEmployeesByStatus(status).subscribe(e => { this.drillEmployees = e; this.drillLoading = false; });
    }
  }

  clearDrill() { this.drillStatus = null; this.drillEmployees = []; }
}
