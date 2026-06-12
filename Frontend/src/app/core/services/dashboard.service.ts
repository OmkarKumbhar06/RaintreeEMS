import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, Employee } from '../../shared/models/models';

const BASE = 'https://localhost:57447/api/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  getStats():                                   Observable<DashboardStats> { return this.http.get<DashboardStats>(`${BASE}/stats`); }
  getEmployeesByStatus(status: string):         Observable<Employee[]>     { return this.http.get<Employee[]>(`${BASE}/employees/${status}`); }
}
