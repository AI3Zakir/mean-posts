import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
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

  onSignup(signupForm: NgForm) {
    if (signupForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(signupForm.value.email, signupForm.value.password);
  }

  ngOnDestroy(): void {
    this.authStatusSubscription.unsubscribe();
  }
}
