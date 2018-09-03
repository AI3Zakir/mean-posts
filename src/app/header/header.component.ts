import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../auth/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  currentUser: User;
  private authListenerSubscription: Subscription;
  private currentUserSubscription: Subscription;

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.userIsAuthenticated = this.authService.getAuthenticationStatus();
    this.authListenerSubscription = this.authService.getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
    this.currentUserSubscription = this.authService.getCurrentUserListener()
      .subscribe((user) => {
        this.currentUser = user;
      });
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy() {
    this.authListenerSubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
