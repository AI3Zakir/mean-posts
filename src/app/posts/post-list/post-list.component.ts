import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  private postsSubscription: Subscription;
  posts: Post[] = [];
  totalPosts = 10;
  isLoading = false;
  postsPerPage = 2;
  page = 1;
  pageSizeOptions = [1, 2, 5, 10];

  constructor(public postsService: PostsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.page);
    this.postsSubscription = this.postsService.getPostUpdateListener().subscribe(
      (postData: {posts: Post[], count: number}) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.count;
      }
    );
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
  }

  onDeletePost(id: string) {
    this.postsService.deletePost(id)
      .subscribe(() => {
        this.postsService.getPosts(this.postsPerPage, this.page);
      });
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.page = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.page);
  }
}
