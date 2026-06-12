import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  getEmployeeByDepartment(): Observable<Employee[]> {
    return this.http.get<Employee[]>('https://localhost:57447/api/reports/employee-by-department');
  }
}
