import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Department } from '../../shared/models/models';

const BASE = 'https://localhost:57447/api/departments';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private http = inject(HttpClient);
  getAll():                                         Observable<Department[]>          { return this.http.get<Department[]>(BASE); }
  getById(id: number):                              Observable<Department>            { return this.http.get<Department>(`${BASE}/${id}`); }
  create(d: Partial<Department>):                   Observable<ApiResponse<number>>   { return this.http.post<ApiResponse<number>>(BASE, d); }
  update(id: number, d: Partial<Department>):       Observable<ApiResponse<boolean>>  { return this.http.put<ApiResponse<boolean>>(`${BASE}/${id}`, d); }
  delete(id: number):                               Observable<ApiResponse<boolean>>  { return this.http.delete<ApiResponse<boolean>>(`${BASE}/${id}`); }
}
