import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../core/services/auth';

type User = {
  Id: string;
  Email: string;
  Role: number;
  Status: number;
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {

  constructor(private http: HttpClient, public auth: Auth) {}

  pendingUsers = signal<User[]>([]);
  users = signal<User[]>([]);

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loadPending();
    this.loadUsers();
  }

  isCurrentUser(id: string) {
  return this.auth.getUserId() === id;
}


  loadPending() {
    this.http.get<User[]>('https://localhost:55842/api/admin/users/pending')
      .subscribe(res => this.pendingUsers.set(res));
  }

  loadUsers() {
    this.http.get<User[]>('https://localhost:55842/api/admin/users')
      .subscribe(res => this.users.set(res));
  }

  approve(id: string) {
    this.http.post(`https://localhost:55842/api/admin/users/${id}/approve`, {})
      .subscribe(() => this.refresh());
  }

  reject(id: string) {
    this.http.post(`https://localhost:55842/api/admin/users/${id}/reject`, {})
      .subscribe(() => this.refresh());
  }

  promote(id: string) {
    this.http.post(`https://localhost:55842/api/admin/users/${id}/promote`, {})
      .subscribe(() => this.refresh());
  }

  delete(id: string) {
    this.http.delete(`https://localhost:55842/api/admin/users/${id}`)
      .subscribe(() => this.refresh());
  }


  roleLabel(role: number) {
    if (role === 0) return 'Admin';
    if (role === 1) return 'User';
    return 'Unknown';
  }

  statusLabel(status: number) {
    if (status === 0) return 'Pending';
    if (status === 1) return 'Approved';
    return 'Rejected';
  }
}
