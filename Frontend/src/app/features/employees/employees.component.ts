import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { DepartmentService } from '../../core/services/department.service';
import { AuthService } from '../../core/services/auth.service';
import { Employee, Department } from '../../shared/models/models';

@Component({
  selector: 'app-employees',
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-users"></i> Employees</h1>
      @if (auth.isAdmin()) {
        <button class="btn btn-primary" (click)="openModal()">
          <i class="fas fa-plus"></i> Add Employee
        </button>
      }
    </div>

    <div class="card">
      <div class="toolbar mb-3">
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input class="form-control" [(ngModel)]="search" placeholder="Search by name, code, department…">
        </div>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th>Code</th><th>Name</th><th>Department</th><th>Designation</th>
            <th>Email</th><th>Mobile</th><th>Joining Date</th><th>Status</th>
            @if (auth.isAdmin()) { <th>Actions</th> }
          </tr></thead>
          <tbody>
            @for (e of filtered; track e.employeeId) {
              <tr>
                <td><strong>{{ e.employeeCode }}</strong></td>
                <td>{{ e.employeeName }}</td>
                <td>{{ e.departmentName }}</td>
                <td>{{ e.designation }}</td>
                <td>{{ e.email }}</td>
                <td>{{ e.mobileNo }}</td>
                <td>{{ formatDate(e.joiningDate) }}</td>
                <td><span class="badge" [class]="e.status === 'Active' ? 'badge-active' : 'badge-inactive'">{{ e.status }}</span></td>
                @if (auth.isAdmin()) {
                  <td>
                    <button class="btn btn-outline btn-sm btn-icon" (click)="openModal(e)"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" style="margin-left:6px" (click)="delete(e.employeeId)"><i class="fas fa-trash"></i></button>
                  </td>
                }
              </tr>
            }
            @if (filtered.length === 0) {
              <tr><td [attr.colspan]="auth.isAdmin() ? 9 : 8" class="text-center" style="padding:36px;color:var(--text-muted)">
                <i class="fas fa-inbox" style="font-size:28px;display:block;margin-bottom:8px"></i>No employees found
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ isEdit ? 'Edit' : 'Add' }} Employee</h3>
            <button class="close-btn" (click)="closeModal()"><i class="fas fa-times"></i></button>
          </div>
          @if (errMsg) { <div class="alert alert-danger"><i class="fas fa-circle-exclamation"></i>{{ errMsg }}</div> }
          <div class="grid-2">
            @if (isEdit) {
              <div class="form-group">
                <label>Employee Code</label>
                <input
                  class="form-control"
                  [(ngModel)]="form.employeeCode"
                  readonly>
              </div>
            }
            <div class="form-group">
              <label>Employee Name <span class="req">*</span></label>
              <input class="form-control" [(ngModel)]="form.employeeName" placeholder="Full name">
            </div>
            <div class="form-group">
              <label>Department <span class="req">*</span></label>
              <select class="form-control" [(ngModel)]="form.departmentId">
                <option [value]="0">— Select Department —</option>
                @for (d of departments; track d.departmentId) {
                  <option [value]="d.departmentId">{{ d.departmentName }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Designation <span class="req">*</span></label>
              <input class="form-control" [(ngModel)]="form.designation" placeholder="e.g. Senior Developer">
            </div>
            <div class="form-group">
              <label>Email <span class="req">*</span></label>
              <input class="form-control" type="email" [(ngModel)]="form.email" placeholder="employee@company.com">
            </div>
            <div class="form-group">
              <label>Mobile No <span class="req">*</span></label>
              <input class="form-control" [(ngModel)]="form.mobileNo" placeholder="10-digit mobile number">
            </div>
            <div class="form-group">
              <label>Joining Date <span class="req">*</span></label>
              <input class="form-control" type="date" [(ngModel)]="form.joiningDate">
            </div>
            <div class="form-group">
              <label>Status <span class="req">*</span></label>
              <select class="form-control" [(ngModel)]="form.status">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="saving">
              @if (saving) { <span class="spinner"></span> }
              {{ isEdit ? 'Update Employee' : 'Save Employee' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`.toolbar{display:flex;justify-content:flex-end;} .req{color:var(--danger);}`]
})
export class EmployeesComponent implements OnInit {
  private empSvc  = inject(EmployeeService);
  private deptSvc = inject(DepartmentService);
  auth            = inject(AuthService);

  employees:   Employee[]   = [];
  departments: Department[] = [];
  search = ''; showModal = false; isEdit = false; saving = false; errMsg = '';
  editId = 0;
  form: any = this.blank();

  blank() { return { employeeCode:'', employeeName:'', departmentId:0, designation:'', email:'', mobileNo:'', joiningDate:'', status:'Active' }; }

  get filtered() {
    const s = this.search.toLowerCase();
    return this.employees.filter(e =>
      e.employeeName.toLowerCase().includes(s) ||
      e.employeeCode.toLowerCase().includes(s) ||
      e.departmentName.toLowerCase().includes(s) ||
      e.designation.toLowerCase().includes(s)
    );
  }

  ngOnInit() {
    this.load();
    this.deptSvc.getAll().subscribe(d => this.departments = d.filter(x => x.status === 'Active'));
  }
  load() { this.empSvc.getAll().subscribe(e => this.employees = e); }

  // openModal(e?: Employee) {
  //   this.isEdit = !!e; this.errMsg = '';
  //   if (e) {
  //     this.form   = { ...e, joiningDate: e.joiningDate?.toString().substring(0, 10) ?? '' };
  //     this.editId = e.employeeId;
  //   } else {
  //     this.form = this.blank(); this.editId = 0;
  //   }
  //   this.showModal = true;
  // }

  openModal(e?: Employee) {
  this.isEdit = !!e;
  this.errMsg = '';

  if (e) {
    this.form = {
      ...e,
      joiningDate: e.joiningDate?.toString().substring(0, 10) ?? ''
    };
    this.editId = e.employeeId;
  } else {
    this.form = this.blank();
    this.editId = 0;
  }

  this.showModal = true;
}
  closeModal() { this.showModal = false; }

  save() {
    const f = this.form;
    if (!f.employeeName || !f.departmentId || !f.designation || !f.email || !f.mobileNo || !f.joiningDate)
      { this.errMsg = 'All fields marked * are required.'; return; }
    if (+f.departmentId === 0) { this.errMsg = 'Please select a department.'; return; }
    this.saving = true;
    const obs = (this.isEdit ? this.empSvc.update(this.editId, f) : this.empSvc.create(f)) as import("rxjs").Observable<import("../../shared/models/models").ApiResponse<any>>;
    obs.subscribe({
      next: r  => { this.saving = false; if (r.success) { this.closeModal(); this.load(); } else this.errMsg = r.message; },
      error: () => { this.saving = false; this.errMsg = 'Server error. Please try again.'; }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this employee? This cannot be undone.')) return;
    this.empSvc.delete(id).subscribe({ next: () => this.load() });
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
