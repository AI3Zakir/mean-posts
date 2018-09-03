import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { User } from './user.model';
import { environment } from '../../environments/environment';

const AUTH_API_URL = environment.apiUrl + '/users';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private user: User;
  private authStatusListener = new Subject<boolean>();
  private currentUserListener = new Subject<User>();
  private tokenTimer: any;

  constructor(private httpClinet: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getCurrentUserListener() {
    return this.currentUserListener.asObservable();
  }

  getAuthenticationStatus() {
    return this.isAuthenticated;
  }

  getCurrentUser() {
    return this.user;
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    return this.httpClinet.post( AUTH_API_URL + '/signup', authData)
      .subscribe((response) => {
        this.router.navigate(['/']);
      }, (error) => {
        this.authStatusListener.next(false);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.httpClinet.post<{token: string, expiresIn: number, user: User}>(AUTH_API_URL + '/login', authData)
      .subscribe((response) => {
        this.token = response.token;
        if (this.token) {
          const expiresInDuration = response.expiresIn;
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.user = response.user;
          this.currentUserListener.next(this.user);
          this.setAuthTimer(expiresInDuration);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData( this.token, expirationDate, this.user);
          this.router.navigate(['/']);
        }
      },(error) => {
        this.authStatusListener.next(false);
      } );
  }

  logout() {
    clearTimeout(this.tokenTimer);
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.currentUserListener.next(null);
    this.clearAuthData();
    this.router.navigate(['/']);
    this.user = null;
  }

  autoAuthUser() {
    const authData = this.getAuthData();
    if (!authData) {
      return;
    }
    const now = new Date();
    const expiresIn = authData.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.user = authData.user;
      this.token = authData.token;
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn / 1000);
    }
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
    localStorage.setItem('id', user.id);
    localStorage.setItem('email', user.email);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('id');
    localStorage.removeItem('email');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expirationDate');
    const id = localStorage.getItem('id');
    const email = localStorage.getItem('email');
    if (!token || !expirationDate || !id || !email) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      user: {
        id: id,
        email: email
      }
    };
  }
}
