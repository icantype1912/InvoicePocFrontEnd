import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  companyName: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private api = 'https://localhost:55842/api/auth';
  private decoded: any | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.api}/login`, data);
  }

  signup(data: SignupRequest): Observable<any> {
    return this.http.post(`${this.api}/signup`, data);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  setToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      this.decoded = null; 
    }
  }

  clearToken() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      this.decoded = null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }


  private getDecoded(): any | null {
    if (this.decoded) return this.decoded;

    const token = this.getToken();
    if (!token) return null;

    try {
      this.decoded = jwtDecode(token);
      return this.decoded;
    } catch {
      return null;
    }
  }


  getRole(): string | null {
    const decoded = this.getDecoded();
    if (!decoded) return null;

    return decoded.role
      || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      || null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  isUser(): boolean {
    return this.getRole() === 'Vendor';
  }


  getUserId(): string | null {
    const decoded = this.getDecoded();
    if (!decoded) return null;

    return decoded.sub
      || decoded.nameid
      || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
      || null;
  }
}
