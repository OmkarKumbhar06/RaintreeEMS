import { Component, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats, Employee } from '../../shared/models/models';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  filter: string | null;
  hint?: string;
}

interface DeptStat {
  name: string;
  count: number;
  pct: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-tachometer-alt"></i> Dashboard
      </h1>
      <span class="live-badge"><span class="live-dot"></span> Live</span>
    </div>

    <!-- Stat cards -->
    @if (stats()) {
      <div class="stats-grid">
        @for (card of statCards(); track card.label) {
          <div
            class="stat-card"
            [class.clickable]="card.filter"
            [class.selected]="selectedFilter() === card.filter"
            (click)="card.filter && openModal(card.filter, card.label)"
          >
            <div class="stat-icon" [style.background]="card.iconBg" [style.color]="card.iconColor">
              <i [class]="'fas ' + card.icon"></i>
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
              @if (card.filter) {
                <div class="stat-hint"><i class="fas fa-eye"></i> View employees</div>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- Bottom grid -->
    <div class="bottom-grid">

      <!-- Department breakdown bar chart -->
      <div class="panel">
        <div class="panel-title">
          <i class="fas fa-chart-bar"></i> Employees by department
        </div>
        @for (d of deptStats(); track d.name; let i = $index) {
          <div
            class="bar-row"
            [class.bar-active]="selectedDept() === d.name"
            (click)="openModal('dept:' + d.name, d.name)"
          >
            <div class="bar-name" [title]="d.name">{{ d.name }}</div>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="d.pct" [style.background]="barColors[i % barColors.length]"></div>
            </div>
            <div class="bar-count">{{ d.count }}</div>
          </div>
        }
      </div>

      <!-- Status legend -->
      <div class="panel">
        <div class="panel-title"><i class="fas fa-users"></i> Status breakdown</div>
        <div class="legend-row">
          <div
            class="leg-item"
            [class.leg-active]="selectedFilter() === 'Active'"
            (click)="openModal('Active', 'Active employees')"
          >
            <span class="leg-dot" style="background:#15803d"></span>
            Active <strong>{{ stats()?.activeEmployees }}</strong>
          </div>
          <div
            class="leg-item"
            [class.leg-active]="selectedFilter() === 'Inactive'"
            (click)="openModal('Inactive', 'Inactive employees')"
          >
            <span class="leg-dot" style="background:#b91c1c"></span>
            Inactive <strong>{{ stats()?.inactiveEmployees }}</strong>
          </div>
        </div>
        @if (stats()) {

<div
    class="circle-chart"
    [style.--active]="activePercent()"
    (click)="openModal('all','All Employees')">

    <div class="circle-center">
        <div class="circle-value">
            {{ activePercent() }}%
        </div>

        <div class="circle-text">
            Active
        </div>
    </div>

</div>

<div class="status-actions">

    <div
        class="status-card active"
        (click)="openModal('Active','Active Employees')">

        <h3>{{stats()?.activeEmployees}}</h3>
        <span>Active Employees</span>

    </div>

    <div
        class="status-card inactive"
        (click)="openModal('Inactive','Inactive Employees')">

        <h3>{{stats()?.inactiveEmployees}}</h3>
        <span>Inactive Employees</span>

    </div>

</div>

}
      </div>
    </div>

    <!-- Modal overlay -->
    @if (modalOpen()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <h3>
              <i class="fas fa-users"></i>
              {{ modalLabel() }}
              <span class="count-badge">{{ filteredEmployees().length }}</span>
            </h3>
            <button class="close-btn" (click)="closeModal()">
              <i class="fas fa-times"></i> Close
            </button>
          </div>

          <div class="modal-search">
            @if (searchQuery) {
              <i class="fas fa-times-circle clear-icon" (click)="clearSearch()"></i>
            }
          </div>

          @if (modalLoading()) {
            <div class="modal-loading">
              <span class="spinner spinner-dark"></span> Loading…
            </div>
          } @else {
            <div class="modal-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style="width:36px">#</th>
                    <th style="width:68px">Code</th>
                    <th style="width:140px">Name</th>
                    <th style="width:110px">Department</th>
                    <th style="width:120px">Designation</th>
                    <th style="width:100px">Mobile</th>
                    <th style="width:76px">Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (e of filteredEmployees(); track e.employeeId; let i = $index) {
                    <tr>
                      <td class="muted-cell">{{ i + 1 }}</td>
                      <td><strong>{{ e.employeeCode }}</strong></td>
                      <td>
                        <div class="name-cell">
                          <span class="avatar">{{ initials(e.employeeName) }}</span>
                          {{ e.employeeName }}
                        </div>
                      </td>
                      <td class="muted-cell">{{ e.departmentName }}</td>
                      <td class="muted-cell">{{ e.designation }}</td>
                      <td class="muted-cell">{{ e.mobileNo }}</td>
                      <td>
                        <span [class]="e.status === 'Active' ? 'badge-active' : 'badge-inactive'">
                          {{ e.status }}
                        </span>
                      </td>
                    </tr>
                  }
                  @if (filteredEmployees().length === 0) {
                    <tr>
                      <td colspan="7" class="empty-row">No employees found</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="modal-footer">
              Showing {{ filteredEmployees().length }} of {{ modalEmployees().length }} employees
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .live-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: #dcfce7; color: #166534; display: inline-flex; align-items: center; gap: 5px; }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #166534; }

    /* Stat cards */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 1.5rem; }
    .stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow); transition: all .2s; border: 1.5px solid transparent; }
    .stat-card.clickable { cursor: pointer; }
    .stat-card.clickable:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.12); }
    .stat-card.selected { border-color: var(--primary); }
    .stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
    .stat-value { font-size: 28px; font-weight: 700; line-height: 1; }
    .stat-label { color: var(--text-muted); font-size: 12px; margin-top: 4px; }
    .stat-hint { font-size: 11px; color: var(--primary); margin-top: 6px; display: flex; align-items: center; gap: 4px; }

    /* Bottom grid */
    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 1.5rem; }
    .panel { background: #fff; border-radius: 12px; padding: 20px; box-shadow: var(--shadow); }
    .panel-title { font-size: 13px; font-weight: 600; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
    .panel-title .muted { font-weight: 400; color: var(--text-muted); }

    /* Dept bars */
    .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; cursor: pointer; padding: 5px 6px; border-radius: 8px; transition: background .12s; }
    .bar-row:hover, .bar-row.bar-active { background: #eff6ff; }
    .bar-name { font-size: 12px; color: var(--text-muted); width: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0; }
    .bar-track { flex: 1; height: 7px; border-radius: 4px; background: #f1f5f9; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width .4s; }
    .bar-count { font-size: 12px; font-weight: 600; width: 24px; text-align: right; flex-shrink: 0; }

    /* Status legend */
    .legend-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
    .leg-item { display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; padding: 4px 10px; border-radius: 8px; border: 1px solid transparent; transition: all .12s; color: var(--text-muted); }
    .leg-item:hover, .leg-item.leg-active { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
    .leg-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
    /*.ratio-bar { height: 10px; border-radius: 5px; overflow: hidden; display: flex; margin-top: 8px; }
    .ratio-active { height: 100%; background: #15803d; }
    .ratio-inactive { height: 100%; background: #b91c1c; }
    .ratio-labels { display: flex; justify-content: space-between; font-size: 11px; margin-top: 6px; }*/

    .circle-chart{
    width:180px;
    height:180px;
    margin:20px auto;

    border-radius:50%;

    background:
      conic-gradient(
        #16a34a 0 calc(var(--active) * 1%),
        #dc2626 calc(var(--active) * 1%) 100%
      );

    display:flex;
    align-items:center;
    justify-content:center;

    cursor:pointer;
    transition:.3s;
}

.circle-chart:hover{
    transform:scale(1.05);
}

.circle-center{
    width:130px;
    height:130px;
    background:white;
    border-radius:50%;

    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
}

.circle-value{
    font-size:28px;
    font-weight:700;
}

.circle-text{
    font-size:13px;
    color:#64748b;
}
    .status-actions{
    display:flex;
    gap:15px;
    margin-top:20px;
}

.status-card{
    flex:1;
    text-align:center;
    padding:15px;
    border-radius:12px;
    cursor:pointer;
    transition:.3s;
}

.status-card:hover{
    transform:translateY(-3px);
}

.status-card.active{
    background:#dcfce7;
    color:#166534;
}

.status-card.inactive{
    background:#fee2e2;
    color:#991b1b;
}

.status-card h3{
    margin:0;
    font-size:24px;
}

    /* Modal overlay — uses normal-flow technique (no position:fixed) */
   .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;

    display: flex;
    justify-content: center;
    align-items: center;

    background: rgba(0,0,0,.55);
    backdrop-filter: blur(3px);
}

.modal-box {
    width: 90%;
    max-width: 1100px;
    max-height: 85vh;
    overflow: hidden;
    border-radius: 16px;
    background: #fff;
}

.status-chart{
    display:flex;
    justify-content:center;
    align-items:center;
    padding:20px;
}

.circle-chart{
    --active:82;

    width:180px;
    height:180px;
    border-radius:50%;

    background:
    conic-gradient(
      #16a34a calc(var(--active) * 1%),
      #dc2626 0
    );

    display:flex;
    justify-content:center;
    align-items:center;

    cursor:pointer;
}

.close-btn{
    background:#dc2626 !important;
    color:#fff !important;
    border:none !important;
}

.close-btn:hover{
    background:#b91c1c !important;
}

.circle-center{
    width:130px;
    height:130px;
    background:white;
    border-radius:50%;

    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
}
    .modal-box { background: #fff; border-radius: 12px; width: 100%; max-width: 780px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.12); }
    .modal-head { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; }
    .modal-head h3 { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .count-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #dbeafe; color: #1e40af; font-weight: 500; }
    .close-btn { background: transparent; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 12px; font-size: 12px; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
    .close-btn:hover { background: #f8fafc; }
    .modal-search { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
    .modal-search input { border: none; outline: none; font-size: 13px; flex: 1; color: var(--text-dark); }
    .clear-icon { cursor: pointer; font-size: 13px; }
    .modal-loading { text-align: center; padding: 40px; color: var(--text-muted); }
    .modal-table-wrap { max-height: 340px; overflow-y: auto; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; }
    thead th { background: #f8fafc; color: var(--text-muted); font-weight: 600; padding: 8px 12px; text-align: left; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; }
    tbody td { padding: 9px 12px; border-bottom: 1px solid #f8fafc; color: var(--text-dark); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    tbody tr:hover td { background: #f8fafc; }
    .muted-cell { color: var(--text-muted) !important; }
    .empty-row { text-align: center; padding: 30px; color: var(--text-muted); }
    .name-cell { display: flex; align-items: center; gap: 6px; }
    .avatar { width: 24px; height: 24px; border-radius: 50%; background: #dbeafe; color: #1e40af; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; flex-shrink: 0; }
    .badge-active { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: #dcfce7; color: #166534; font-weight: 500; }
    .badge-inactive { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: #fee2e2; color: #991b1b; font-weight: 500; }
    .modal-footer { padding: 8px 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: var(--text-muted); }

    @media (max-width: 640px) { .bottom-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  private svc = inject(DashboardService);

  readonly barColors = ['#378ADD', '#1D9E75', '#7F77DD', '#D85A30', '#BA7517', '#0F6E56'];

  stats = signal<DashboardStats | null>(null);
  allEmployees = signal<Employee[]>([]);

  statCards = computed<StatCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      { label: 'Total employees',    value: s.totalEmployees,    icon: 'fa-users',      iconBg: '#dbeafe', iconColor: '#1e40af', filter: 'all'      },
      { label: 'Active employees',   value: s.activeEmployees,   icon: 'fa-user-check', iconBg: '#dcfce7', iconColor: '#166534', filter: 'Active'   },
      { label: 'Inactive employees', value: s.inactiveEmployees, icon: 'fa-user-times', iconBg: '#fee2e2', iconColor: '#991b1b', filter: 'Inactive' },
      { label: 'Total departments',  value: s.totalDepartments,  icon: 'fa-sitemap',    iconBg: '#ede9fe', iconColor: '#5b21b6', filter: null       },
    ];
  });

  deptStats = computed<DeptStat[]>(() => {
    const emps = this.allEmployees();
    if (!emps.length) return [];
    const map = new Map<string, number>();
    emps.forEach(e => map.set(e.departmentName, (map.get(e.departmentName) ?? 0) + 1));
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = sorted[0][1];
    return sorted.map(([name, count]) => ({ name, count, pct: Math.round(count / max * 100) }));
  });

  activePercent = computed(() => {
    const s = this.stats();
    if (!s || !s.totalEmployees) return 0;
    return Math.round(s.activeEmployees / s.totalEmployees * 100);
  });

  modalOpen    = signal(false);
  modalLoading = signal(false);
  modalLabel   = signal('');
  modalEmployees = signal<Employee[]>([]);
  selectedFilter = signal<string | null>(null);
  selectedDept   = signal<string | null>(null);
  searchQuery  = '';

  filteredEmployees = computed(() => {
    const q = this.searchQuery.toLowerCase();
    const emps = this.modalEmployees();
    if (!q) return emps;
    return emps.filter(e =>
      e.employeeName.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q) ||
      e.designation?.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    forkJoin({
      stats: this.svc.getStats(),
      active: this.svc.getEmployeesByStatus('Active'),
      inactive: this.svc.getEmployeesByStatus('Inactive'),
    }).subscribe(({ stats, active, inactive }) => {
      this.stats.set(stats);
      this.allEmployees.set([...active, ...inactive].sort((a, b) => a.employeeName.localeCompare(b.employeeName)));
    });
  }

  openModal(filter: string, label: string) {
    this.searchQuery = '';
    this.modalLabel.set(label);

    if (filter.startsWith('dept:')) {
      const deptName = filter.slice(5);
      this.selectedDept.set(deptName);
      this.selectedFilter.set(null);
      this.modalEmployees.set(this.allEmployees().filter(e => e.departmentName === deptName));
    } else {
      this.selectedFilter.set(filter);
      this.selectedDept.set(null);
      const emps = filter === 'all'
        ? this.allEmployees()
        : this.allEmployees().filter(e => e.status === filter);
      this.modalEmployees.set(emps);
    }
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.selectedFilter.set(null);
    this.selectedDept.set(null);
    this.searchQuery = '';
  }

  onSearch() {}

  clearSearch() { this.searchQuery = ''; }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}