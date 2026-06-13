import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { Employee } from '../../shared/models/models';

type TabKey = 'employees' | 'departments' | 'status';

@Component({
  selector: 'app-reports',
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-chart-bar"></i> Employee Reports</h1>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" [class.active]="activeTab === 'employees'" (click)="activeTab = 'employees'">
        <i class="fas fa-table"></i> Employees
      </button>
      <button class="tab" [class.active]="activeTab === 'departments'" (click)="activeTab = 'departments'">
        <i class="fas fa-sitemap"></i> Departments
      </button>
      <button class="tab" [class.active]="activeTab === 'status'" (click)="activeTab = 'status'">
        <i class="fas fa-toggle-on"></i> Status
      </button>
    </div>

    @if (loading) {
      <div class="card text-center" style="padding:60px;color:var(--text-muted)">
        <span class="spinner spinner-dark" style="width:30px;height:30px;border-width:3px"></span>
        <p style="margin-top:12px">Loading report…</p>
      </div>
    } @else {

      <!-- ============ EMPLOYEES TAB ============ -->
      @if (activeTab === 'employees') {

        <!-- Filter bar -->
        <div class="card filter-bar mb-3">
          <div class="filter-group">
            <label>Department</label>
            <select class="form-control" [(ngModel)]="filterDept" (ngModelChange)="onFilterChange()">
              <option value="">All Departments</option>
              @for (d of departmentNames; track d) {
                <option [value]="d">{{ d }}</option>
              }
            </select>
          </div>
          <div class="filter-group">
            <label>Status</label>
            <select class="form-control" [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div class="filter-group">
            <label>From Date</label>
            <input class="form-control" type="date" [(ngModel)]="filterFrom" (ngModelChange)="onFilterChange()">
          </div>
          <div class="filter-group">
            <label>To Date</label>
            <input class="form-control" type="date" [(ngModel)]="filterTo" (ngModelChange)="onFilterChange()">
          </div>
          <div class="filter-group filter-search">
            <label>Search</label>
            <div class="search-wrap">
              <i class="fas fa-search"></i>
              <input class="form-control" [(ngModel)]="search" (ngModelChange)="onFilterChange()" placeholder="Name, code, designation…">
            </div>
          </div>
          @if (filterDept || filterStatus || filterFrom || filterTo || search) {
            <div class="filter-group filter-clear">
              <label>&nbsp;</label>
              <button class="btn btn-outline" (click)="clearFilters()">
                <i class="fas fa-times"></i> Clear filters
              </button>
            </div>
          }
        </div>

        <!-- Export toolbar -->
        <div class="export-bar mb-3">
          <span class="result-count">
            Showing {{ filtered.length }} of {{ allEmployees.length }} employees
          </span>
          <div class="export-buttons">
            <button class="btn btn-outline btn-sm" (click)="exportExcel()">
              <i class="fas fa-file-excel"></i> Export Excel
            </button>
            <button class="btn btn-outline btn-sm" (click)="exportCSV()">
              <i class="fas fa-file-csv"></i> Export CSV
            </button>
          </div>
        </div>

        <!-- Data table -->
        <div class="card" id="printable-report">
          <div class="print-only print-header">
            <h2>Employee Master Report</h2>
            <p>Generated on {{ todayLabel }}</p>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr>
                <th>#</th><th>Code</th><th>Name</th><th>Department</th>
                <th>Designation</th><th>Email</th><th>Mobile</th>
                <th>Joining Date</th><th>Status</th>
              </tr></thead>
              <tbody>
                @for (e of pagedRows; track e.employeeCode; let i = $index) {
                  <tr>
                    <td>{{ (page - 1) * pageSize + i + 1 }}</td>
                    <td><strong>{{ e.employeeCode }}</strong></td>
                    <td>{{ e.employeeName }}</td>
                    <td>{{ e.departmentName }}</td>
                    <td>{{ e.designation }}</td>
                    <td>{{ e.email }}</td>
                    <td>{{ e.mobileNo }}</td>
                    <td>{{ formatDate(e.joiningDate) }}</td>
                    <td><span class="badge" [class]="e.status === 'Active' ? 'badge-active' : 'badge-inactive'">{{ e.status }}</span></td>
                  </tr>
                }
                @if (filtered.length === 0) {
                  <tr><td colspan="9" class="text-center" style="padding:36px;color:var(--text-muted)">
                    <i class="fas fa-search" style="font-size:28px;display:block;margin-bottom:8px"></i>
                    No employees match the current filters
                  </td></tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (filtered.length > 0) {
            <div class="pagination no-print">
              <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
              <div class="page-buttons">
                <button class="btn btn-outline btn-sm" [disabled]="page === 1" (click)="goToPage(page - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
                @for (p of pageNumbers; track p) {
                  <button class="btn btn-sm" [class.btn-primary]="p === page" [class.btn-outline]="p !== page" (click)="goToPage(p)">
                    {{ p }}
                  </button>
                }
                <button class="btn btn-outline btn-sm" [disabled]="page === totalPages" (click)="goToPage(page + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
              <select class="form-control page-size" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
                <option [value]="10">10 / page</option>
                <option [value]="25">25 / page</option>
                <option [value]="50">50 / page</option>
                <option [value]="100">100 / page</option>
              </select>
            </div>
          }
        </div>
      }

      <!-- ============ DEPARTMENTS TAB ============ -->
      @if (activeTab === 'departments') {
        <div class="card mb-3">
          <h3 class="section-title"><i class="fas fa-sitemap"></i> Department Summary</h3>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Department</th><th>Total</th><th>Active</th><th>Inactive</th></tr></thead>
              <tbody>
                @for (d of departmentSummary; track d.name) {
                  <tr class="clickable-row" (click)="goToDeptEmployees(d.name)">
                    <td><strong>{{ d.name }}</strong></td>
                    <td>{{ d.total }}</td>
                    <td><span class="badge badge-active">{{ d.active }}</span></td>
                    <td><span class="badge badge-inactive">{{ d.inactive }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h3 class="section-title"><i class="fas fa-chart-bar"></i> Employees by Department</h3>
          <p class="section-subtitle">Department-wise employee strength</p>
          <div class="bars">
            @for (d of departmentSummary; track d.name) {
              <div class="bar-row">
                <div class="bar-label">{{ d.name }}</div>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="(d.total / maxDeptCount) * 100"></div>
                </div>
                <div class="bar-value">{{ d.total }}</div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ============ STATUS TAB ============ -->
      @if (activeTab === 'status') {
        <div class="status-grid">
          <div class="card status-card" (click)="goToStatusEmployees('Active')">
            <div class="status-icon active"><i class="fas fa-user-check"></i></div>
            <div>
              <div class="status-value">{{ activeCount }}</div>
              <div class="status-label">Active Employees</div>
            </div>
            <div class="status-action">View Active <i class="fas fa-arrow-right"></i></div>
          </div>
          <div class="card status-card" (click)="goToStatusEmployees('Inactive')">
            <div class="status-icon inactive"><i class="fas fa-user-times"></i></div>
            <div>
              <div class="status-value">{{ inactiveCount }}</div>
              <div class="status-label">Inactive Employees</div>
            </div>
            <div class="status-action">View Inactive <i class="fas fa-arrow-right"></i></div>
          </div>
        </div>

        <div class="card mt-3">
          <h3 class="section-title"><i class="fas fa-chart-pie"></i> Employee Status Distribution</h3>
          <p class="section-subtitle">Active versus inactive employees</p>
          <div class="status-bars">
            <div class="status-bar-row">
              <div class="status-bar-label">Active</div>
              <div class="bar-track">
                <div class="bar-fill bar-active" [style.width.%]="(activeCount / allEmployees.length) * 100"></div>
              </div>
              <div class="bar-value">{{ activeCount }} ({{ activePercent }}%)</div>
            </div>
            <div class="status-bar-row">
              <div class="status-bar-label">Inactive</div>
              <div class="bar-track">
                <div class="bar-fill bar-inactive" [style.width.%]="(inactiveCount / allEmployees.length) * 100"></div>
              </div>
              <div class="bar-value">{{ inactiveCount }} ({{ inactivePercent }}%)</div>
            </div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
    .tab {
      padding: 10px 18px; background: none; border: none; cursor: pointer;
      font-size: 14px; font-weight: 500; color: var(--text-muted);
      border-bottom: 2px solid transparent; display: flex; align-items: center; gap: 6px;
      transition: all .15s;
    }
    .tab:hover { color: var(--text); }
    .tab.active { color: var(--primary); border-bottom-color: var(--primary); }

    .filter-bar { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; gap: 5px; min-width: 150px; }
    .filter-group label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .filter-search { flex: 1; min-width: 200px; }
    .filter-clear { min-width: auto; }

    .export-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .result-count { font-size: 13px; color: var(--text-muted); }
    .export-buttons { display: flex; gap: 8px; flex-wrap: wrap; }

    .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 10px; }
    .page-info { font-size: 13px; color: var(--text-muted); }
    .page-buttons { display: flex; gap: 4px; }
    .page-size { width: auto; }

    .section-title { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .section-subtitle { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }

    .clickable-row { cursor: pointer; }
    .clickable-row:hover td { background: var(--primary-light); }

    .bars { display: flex; flex-direction: column; gap: 12px; }
    .bar-row { display: grid; grid-template-columns: 180px 1fr 50px; align-items: center; gap: 12px; }
    .bar-label { font-size: 13px; font-weight: 500; }
    .bar-track { height: 18px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--primary); border-radius: 6px; transition: width .3s; }
    .bar-fill.bar-active { background: #16a34a; }
    .bar-fill.bar-inactive { background: #dc2626; }
    .bar-value { font-size: 13px; font-weight: 600; text-align: right; }

    .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
    .status-card { display: flex; align-items: center; gap: 18px; cursor: pointer; transition: all .2s; position: relative; }
    .status-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.1); }
    .status-icon { width: 54px; height: 54px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
    .status-icon.active { background: #dcfce7; color: #15803d; }
    .status-icon.inactive { background: #fee2e2; color: #b91c1c; }
    .status-value { font-size: 28px; font-weight: 800; }
    .status-label { font-size: 13px; color: var(--text-muted); }
    .status-action { position: absolute; bottom: 12px; right: 16px; font-size: 12px; color: var(--primary); }

    .status-bars { display: flex; flex-direction: column; gap: 14px; }
    .status-bar-row { display: grid; grid-template-columns: 80px 1fr 110px; align-items: center; gap: 12px; }
    .status-bar-label { font-size: 13px; font-weight: 600; }

    .print-only { display: none; }

    @media print {
      .page-header, .tabs, .filter-bar, .export-bar, .pagination, .no-print { display: none !important; }
      .print-only { display: block; margin-bottom: 16px; }
      .print-header h2 { font-size: 18px; margin-bottom: 4px; }
      .print-header p { font-size: 12px; color: #666; }
      .card { box-shadow: none; border: none; padding: 0; }
      .table th, .table td { font-size: 11px; padding: 6px 8px; }
    }
  `]
})
export class ReportsComponent implements OnInit {
  private svc = inject(ReportService);

  allEmployees: Employee[] = [];
  loading = true;

  activeTab: TabKey = 'employees';

  // Filters
  filterDept   = '';
  filterStatus = '';
  filterFrom   = '';
  filterTo     = '';
  search       = '';

  // Pagination
  page = 1;
  pageSize = 10;

  todayLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  ngOnInit() {
    this.svc.getEmployeeByDepartment().subscribe(data => {
      this.allEmployees = data;
      this.loading = false;
    });
  }

  // ---------------------------------------------------------------
  // EMPLOYEES TAB — filtering & pagination
  // ---------------------------------------------------------------

  get departmentNames(): string[] {
    return [...new Set(this.allEmployees.map(e => e.departmentName))].sort();
  }

  get filtered(): Employee[] {
    const s = this.search.toLowerCase();
    return this.allEmployees.filter(e => {
      if (this.filterDept && e.departmentName !== this.filterDept) return false;
      if (this.filterStatus && e.status !== this.filterStatus) return false;

      if (this.filterFrom || this.filterTo) {
        const joining = e.joiningDate?.toString().substring(0, 10);
        if (this.filterFrom && joining < this.filterFrom) return false;
        if (this.filterTo && joining > this.filterTo) return false;
      }

      if (s) {
        const matches = e.employeeName.toLowerCase().includes(s) ||
                         e.employeeCode.toLowerCase().includes(s) ||
                         e.designation.toLowerCase().includes(s) ||
                         e.email.toLowerCase().includes(s);
        if (!matches) return false;
      }

      return true;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get pagedRows(): Employee[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.page;
    const range: number[] = [];
    const maxButtons = 5;

    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  onFilterChange() {
    this.page = 1;
  }

  onPageSizeChange() {
    this.page = 1;
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
  }

  clearFilters() {
    this.filterDept = '';
    this.filterStatus = '';
    this.filterFrom = '';
    this.filterTo = '';
    this.search = '';
    this.page = 1;
  }

  // ---------------------------------------------------------------
  // DEPARTMENTS TAB
  // ---------------------------------------------------------------

  get departmentSummary() {
    const map = new Map<string, { name: string; total: number; active: number; inactive: number }>();
    for (const e of this.allEmployees) {
      const entry = map.get(e.departmentName) ?? { name: e.departmentName, total: 0, active: 0, inactive: 0 };
      entry.total++;
      if (e.status === 'Active') entry.active++; else entry.inactive++;
      map.set(e.departmentName, entry);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  get maxDeptCount(): number {
    return Math.max(1, ...this.departmentSummary.map(d => d.total));
  }

  goToDeptEmployees(deptName: string) {
    this.activeTab = 'employees';
    this.filterDept = deptName;
    this.filterStatus = '';
    this.search = '';
    this.page = 1;
  }

  // ---------------------------------------------------------------
  // STATUS TAB
  // ---------------------------------------------------------------

  get activeCount(): number {
    return this.allEmployees.filter(e => e.status === 'Active').length;
  }

  get inactiveCount(): number {
    return this.allEmployees.filter(e => e.status === 'Inactive').length;
  }

  get activePercent(): number {
    return this.allEmployees.length ? Math.round((this.activeCount / this.allEmployees.length) * 100) : 0;
  }

  get inactivePercent(): number {
    return this.allEmployees.length ? Math.round((this.inactiveCount / this.allEmployees.length) * 100) : 0;
  }

  goToStatusEmployees(status: string) {
    this.activeTab = 'employees';
    this.filterStatus = status;
    this.filterDept = '';
    this.search = '';
    this.page = 1;
  }

  // ---------------------------------------------------------------
  // EXPORT / PRINT
  // ---------------------------------------------------------------

  exportCSV() {
    const header = 'Code,Name,Department,Designation,Email,Mobile,Joining Date,Status';
    const rows = this.filtered.map(e =>
      `"${e.employeeCode}","${e.employeeName}","${e.departmentName}","${e.designation}","${e.email}","${e.mobileNo}","${this.formatDate(e.joiningDate)}","${e.status}"`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    this.download(blob, 'csv');
  }

  exportExcel() {
    // Build a simple Excel-compatible XML (SpreadsheetML) - works in Excel without any extra library.
    const header = ['Code', 'Name', 'Department', 'Designation', 'Email', 'Mobile', 'Joining Date', 'Status'];
    const rows = this.filtered.map(e => [
      e.employeeCode, e.employeeName, e.departmentName, e.designation,
      e.email, e.mobileNo, this.formatDate(e.joiningDate), e.status
    ]);

    const escapeXml = (val: string) =>
      val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const headerCells = header.map(h => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('');
    const bodyRows = rows.map(r =>
      `<Row>${r.map(c => `<Cell><Data ss:Type="String">${escapeXml(String(c))}</Data></Cell>`).join('')}</Row>`
    ).join('');

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Employee Report">
  <Table>
   <Row>${headerCells}</Row>
   ${bodyRows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    this.download(blob, 'xls');
  }

  printReport() {
    window.print();
  }

  private download(blob: Blob, ext: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employee-report-${new Date().toISOString().slice(0, 10)}.${ext}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}