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
              <input class="form-control" [class.is-invalid]="fieldErrors.employeeName"
                     [(ngModel)]="form.employeeName" placeholder="Full name"
                     (blur)="validateField('employeeName')">
              @if (fieldErrors.employeeName) {
                <div class="field-error"><i class="fas fa-circle-exclamation"></i> {{ fieldErrors.employeeName }}</div>
              }
            </div>

            <div class="form-group">
              <label>Department <span class="req">*</span></label>
              <select class="form-control" [class.is-invalid]="fieldErrors.departmentId"
                      [(ngModel)]="form.departmentId"
                      (blur)="validateField('departmentId')"
                      (change)="validateField('departmentId')">
                <option [value]="0">— Select Department —</option>
                @for (d of departments; track d.departmentId) {
                  <option [value]="d.departmentId">{{ d.departmentName }}</option>
                }
              </select>
              @if (fieldErrors.departmentId) {
                <div class="field-error"><i class="fas fa-circle-exclamation"></i> {{ fieldErrors.departmentId }}</div>
              }
            </div>

            <div class="form-group">
              <label>Designation <span class="req">*</span></label>
              <input class="form-control" [class.is-invalid]="fieldErrors.designation"
                     [(ngModel)]="form.designation" placeholder="e.g. Senior Developer"
                     (blur)="validateField('designation')">
              @if (fieldErrors.designation) {
                <div class="field-error"><i class="fas fa-circle-exclamation"></i> {{ fieldErrors.designation }}</div>
              }
            </div>

            <div class="form-group">
              <label>Email <span class="req">*</span></label>
              <input class="form-control" [class.is-invalid]="fieldErrors.email"
                     type="email" [(ngModel)]="form.email" placeholder="employee@company.com"
                     (blur)="validateField('email')">
              @if (fieldErrors.email) {
                <div class="field-error"><i class="fas fa-circle-exclamation"></i> {{ fieldErrors.email }}</div>
              }
            </div>

            <div class="form-group">
              <label>Mobile No <span class="req">*</span></label>
              <input class="form-control" [class.is-invalid]="fieldErrors.mobileNo"
                     [(ngModel)]="form.mobileNo" placeholder="10-digit mobile number"
                     maxlength="10" (blur)="validateField('mobileNo')">
              @if (fieldErrors.mobileNo) {
                <div class="field-error"><i class="fas fa-circle-exclamation"></i> {{ fieldErrors.mobileNo }}</div>
              }
            </div>

            <div class="form-group">
              <label>Joining Date <span class="req">*</span></label>
              <input class="form-control" [class.is-invalid]="fieldErrors.joiningDate"
                     type="date" [(ngModel)]="form.joiningDate"
                     [max]="todayStr" (blur)="validateField('joiningDate')"
                     (change)="validateField('joiningDate')">
              @if (fieldErrors.joiningDate) {
                <div class="field-error"><i class="fas fa-circle-exclamation"></i> {{ fieldErrors.joiningDate }}</div>
              }
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
  styles: [`
    .toolbar{display:flex;justify-content:flex-end;}
    .req{color:var(--danger);}
    .form-control.is-invalid { border-color: var(--danger); }
    .field-error {
      color: var(--danger);
      font-size: 12px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
  `]
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

  // Field-level validation error messages, with explicit keys (avoids
  // TS4111 "comes from an index signature" errors with noPropertyAccessFromIndexSignature)
  fieldErrors: {
    employeeName?: string;
    departmentId?: string;
    designation?: string;
    email?: string;
    mobileNo?: string;
    joiningDate?: string;
  } = {};

  // Used to cap the "Joining Date" input at today
  todayStr = new Date().toISOString().substring(0, 10);

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

  openModal(e?: Employee) {
    this.isEdit = !!e;
    this.errMsg = '';
    this.fieldErrors = {};

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

  closeModal() {
    this.showModal = false;
    this.fieldErrors = {};
    this.errMsg = '';
    this.load();
  }

  /**
   * Validates a single field on blur/change and updates fieldErrors.
   * Returns true if the field is valid.
   */
  validateField(field: keyof typeof this.fieldErrors): boolean {
    const f = this.form;
    let message = '';

    switch (field) {
      case 'employeeName':
        if (!f.employeeName?.trim()) {
          message = 'Employee name is required.';
        } else if (f.employeeName.trim().length < 2) {
          message = 'Employee name must be at least 2 characters.';
        } else if (!/^[A-Za-z\s.'-]+$/.test(f.employeeName.trim())) {
          message = 'Employee name can only contain letters and spaces.';
        }
        break;

      case 'departmentId':
        if (!f.departmentId || +f.departmentId === 0) {
          message = 'Please select a department.';
        }
        break;

      case 'designation':
        if (!f.designation?.trim()) {
          message = 'Designation is required.';
        } else if (f.designation.trim().length < 2) {
          message = 'Designation must be at least 2 characters.';
        }
        break;

      case 'email':
        if (!f.email?.trim()) {
          message = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) {
          message = 'Enter a valid email address.';
        }
        break;

      case 'mobileNo':
        if (!f.mobileNo?.trim()) {
          message = 'Mobile number is required.';
        } else if (!/^[6-9]\d{9}$/.test(f.mobileNo.trim())) {
          message = 'Enter a valid 10-digit mobile number.';
        }
        break;

      case 'joiningDate':
        if (!f.joiningDate) {
          message = 'Joining date is required.';
        } else if (f.joiningDate > this.todayStr) {
          message = 'Joining date cannot be in the future.';
        }
        break;
    }

    if (message) {
      this.fieldErrors[field] = message;
      return false;
    } else {
      delete this.fieldErrors[field];
      return true;
    }
  }

  /** Validates every field at once (used on Save). Returns true if the whole form is valid. */
  validateAll(): boolean {
    const fields: (keyof typeof this.fieldErrors)[] =
      ['employeeName', 'departmentId', 'designation', 'email', 'mobileNo', 'joiningDate'];
    let valid = true;
    for (const field of fields) {
      if (!this.validateField(field)) valid = false;
    }
    return valid;
  }

  save() {
    this.errMsg = '';

    if (!this.validateAll()) {
      this.errMsg = 'Please fix the highlighted fields before saving.';
      return;
    }

    const f = this.form;
    this.saving = true;
    const obs = (this.isEdit ? this.empSvc.update(this.editId, f) : this.empSvc.create(f)) as import("rxjs").Observable<import("../../shared/models/models").ApiResponse<any>>;
    obs.subscribe({
      next: r => {
        this.saving = false;
        if (r.success) {
          this.closeModal();
          this.load();
        } else {
          // 2xx response but success:false (some endpoints may do this)
          this.errMsg = r.message || 'Something went wrong. Please try again.';
        }
      },
      error: (err) => {
        this.saving = false;

        // The backend's BadRequest(result) / Conflict(result) puts the
        // ApiResponse JSON body in err.error - read its "message" field.
        const backendMessage = err?.error?.message;

        if (backendMessage) {
          // e.g. "Employee code 'EMP010' already exists"
          this.errMsg = backendMessage;
        } else if (err.status === 0) {
          this.errMsg = 'Cannot connect to server. Please check your connection.';
        } else if (err.status === 401) {
          this.errMsg = 'Your session has expired. Please log in again.';
        } else if (err.status === 403) {
          this.errMsg = 'You do not have permission to perform this action.';
        } else if (err.status === 409) {
          this.errMsg = 'This record already exists.';
        } else if (err.status === 404) {
          this.errMsg = 'Record not found. It may have been deleted.';
        } else {
          this.errMsg = 'Server error. Please try again.';
        }
      }
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