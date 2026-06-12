import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Employee } from '../../shared/models/models';

const BASE = 'https://localhost:57447/api/employees';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  getAll():                                       Observable<Employee[]>           { return this.http.get<Employee[]>(BASE); }
  getById(id: number):                            Observable<Employee>             { return this.http.get<Employee>(`${BASE}/${id}`); }
  create(e: Partial<Employee>):                   Observable<ApiResponse<number>>  { return this.http.post<ApiResponse<number>>(BASE, e); }
  update(id: number, e: Partial<Employee>):       Observable<ApiResponse<boolean>> { return this.http.put<ApiResponse<boolean>>(`${BASE}/${id}`, e); }
  delete(id: number):                             Observable<ApiResponse<boolean>> { return this.http.delete<ApiResponse<boolean>>(`${BASE}/${id}`); }
}
