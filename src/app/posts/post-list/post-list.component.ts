import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/user.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  private postsSubscription: Subscription;
  private authListenerSubscription: Subscription;
  private currentUserSubscription: Subscription;
  posts: Post[] = [];
  totalPosts = 10;
  isLoading = false;
  postsPerPage = 2;
  page = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated: boolean;
  currentUser: User;
  serverUrl = environment.apiUrl;

  constructor(public postsService: PostsService, private authService: AuthService) {
  }

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getAuthenticationStatus();
    this.currentUser = this.authService.getCurrentUser();
    this.isLoading = true;
    this.postsSubscription = this.postsService.getPostUpdateListener()
      .subscribe(
        (postData: { posts: Post[], count: number }) => {
          this.isLoading = false;
          this.posts = postData.posts;
          this.totalPosts = postData.count;
        }
      );
    this.authListenerSubscription = this.authService.getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.currentUser = this.authService.getCurrentUser();
      });
    this.currentUserSubscription = this.authService.getCurrentUserListener()
      .subscribe((user) => {
        this.currentUser = user;
      });
    this.postsService.getPosts(this.postsPerPage, this.page);


  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
    this.authListenerSubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
  }

  onDeletePost(id: string) {
    this.isLoading = true;
    this.postsService.deletePost(id)
      .subscribe(() => {
        this.postsService.getPosts(this.postsPerPage, this.page);
      }, () => {
        this.isLoading = false;
      });
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.page = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.page);
  }
}
