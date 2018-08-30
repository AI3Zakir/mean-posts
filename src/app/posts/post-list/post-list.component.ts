import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  private postsSubscription: Subscription
  posts: Post[] = [];
  constructor(public postsService: PostsService) {}

  ngOnInit() {
    this.posts = this.postsService.getPosts();
    this.postsSubscription = this.postsService.getPostUpdateListener().subscribe(
      (posts: Post[]) => {
        this.posts = posts;
      }
    );
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
  }
}
