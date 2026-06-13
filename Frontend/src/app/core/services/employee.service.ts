import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Employee } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private get url() { return `${environment.apiUrl}/employees`; }

  getAll():                                       Observable<Employee[]>           { return this.http.get<Employee[]>(this.url); }
  getById(id: number):                            Observable<Employee>             { return this.http.get<Employee>(`${this.url}/${id}`); }
  create(e: Partial<Employee>):                   Observable<ApiResponse<number>>  { return this.http.post<ApiResponse<number>>(this.url, e); }
  update(id: number, e: Partial<Employee>):       Observable<ApiResponse<boolean>> { return this.http.put<ApiResponse<boolean>>(`${this.url}/${id}`, e); }
  delete(id: number):                             Observable<ApiResponse<boolean>> { return this.http.delete<ApiResponse<boolean>>(`${this.url}/${id}`); }
}