import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../core/services/department.service';
import { AuthService } from '../../core/services/auth.service';
import { Department } from '../../shared/models/models';

@Component({
  selector: 'app-departments',
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-sitemap"></i> Departments</h1>
      @if (auth.isAdmin()) {
        <button class="btn btn-primary" (click)="openModal()">
          <i class="fas fa-plus"></i> Add Department
        </button>
      }
    </div>

    <div class="card">
      <div class="toolbar mb-3">
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input class="form-control" [(ngModel)]="search" placeholder="Search departments…">
        </div>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th>#</th><th>Department Name</th><th>Description</th>
            <th>Status</th><th>Created</th>
            @if (auth.isAdmin()) { <th>Actions</th> }
          </tr></thead>
          <tbody>
            @for (d of filtered; track d.departmentId; let i = $index) {
              <tr>
                <td>{{ i + 1 }}</td>
                <td><strong>{{ d.departmentName }}</strong></td>
                <td class="text-muted">{{ d.description || '—' }}</td>
                <td><span class="badge" [class]="d.status === 'Active' ? 'badge-active' : 'badge-inactive'">{{ d.status }}</span></td>
                <td class="text-muted">{{ formatDate(d.createdAt) }}</td>
                @if (auth.isAdmin()) {
                  <td>
                    <button class="btn btn-outline btn-sm btn-icon" title="Edit" (click)="openModal(d)"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger  btn-sm btn-icon" title="Delete" style="margin-left:6px" (click)="delete(d.departmentId)"><i class="fas fa-trash"></i></button>
                  </td>
                }
              </tr>
            }
            @if (filtered.length === 0) {
              <tr><td [attr.colspan]="auth.isAdmin() ? 6 : 5" class="text-center" style="padding:36px;color:var(--text-muted)">
                <i class="fas fa-inbox" style="font-size:28px;display:block;margin-bottom:8px"></i>No departments found
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ isEdit ? 'Edit' : 'Add' }} Department</h3>
            <button class="close-btn" (click)="closeModal()"><i class="fas fa-times"></i></button>
          </div>
          @if (errMsg) { <div class="alert alert-danger"><i class="fas fa-circle-exclamation"></i>{{ errMsg }}</div> }
          <div class="form-group">
            <label>Department Name <span class="req">*</span></label>
            <input class="form-control" [(ngModel)]="form.departmentName" placeholder="e.g. Information Technology">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" [(ngModel)]="form.description" placeholder="Optional description…"></textarea>
          </div>
          <div class="form-group">
            <label>Status <span class="req">*</span></label>
            <select class="form-control" [(ngModel)]="form.status">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="saving">
              @if (saving) { <span class="spinner"></span> }
              {{ isEdit ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`.toolbar{display:flex;justify-content:flex-end;} .req{color:var(--danger);}`]
})
export class DepartmentsComponent implements OnInit {
  private svc = inject(DepartmentService);
  auth        = inject(AuthService);

  departments: Department[] = [];
  search = ''; showModal = false; isEdit = false; saving = false; errMsg = '';
  editId = 0;
  form: Partial<Department> = {};

  get filtered() {
    const s = this.search.toLowerCase();
    return this.departments.filter(d =>
      d.departmentName.toLowerCase().includes(s) ||
      (d.description ?? '').toLowerCase().includes(s)
    );
  }

  ngOnInit() { this.load(); }
  load()     { this.svc.getAll().subscribe(d => this.departments = d); }

  openModal(d?: Department) {
    this.isEdit = !!d; this.errMsg = '';
    this.form   = d ? { ...d } : { departmentName: '', description: '', status: 'Active' };
    this.editId = d?.departmentId ?? 0;
    this.showModal = true;
  }
  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.departmentName?.trim()) { this.errMsg = 'Department name is required.'; return; }
    this.saving = true;
    const obs = (this.isEdit ? this.svc.update(this.editId, this.form) : this.svc.create(this.form)) as import("rxjs").Observable<import("../../shared/models/models").ApiResponse<any>>;
    obs.subscribe({
      next: r  => { this.saving = false; if (r.success) { this.closeModal(); this.load(); } else this.errMsg = r.message; },
      error: () => { this.saving = false; this.errMsg = 'Server error. Please try again.'; }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this department? This cannot be undone.')) return;
    this.svc.delete(id).subscribe({
      next: r  => { if (r.success) this.load(); else alert(r.message); },
      error: () => alert('Delete failed.')
    });
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
