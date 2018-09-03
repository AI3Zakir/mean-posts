import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSubscription: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authStatusSubscription = this.authService.getAuthStatusListener().subscribe(
      (authStatus) => {
        this.isLoading = false;
      }, (error) => {
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.authStatusSubscription.unsubscribe();
  }

  onLogin(loginForm: NgForm) {
    if (loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.login(loginForm.value.email, loginForm.value.password);
  }
}
