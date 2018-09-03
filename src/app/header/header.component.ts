import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  private authListenerSubscription: Subscription;

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getAuthenticationStatus();
    this.authListenerSubscription = this.authService.getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  ngOnDestroy() {
    this.authListenerSubscription.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
