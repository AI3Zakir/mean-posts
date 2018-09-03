import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { count, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], count: number}>();
  public count: number;

  constructor(private httpClient: HttpClient, private router: Router) {
  }

  getPosts(postsPerPage: number, page: number) {
    const queryParams = `?postsPerPage=${postsPerPage}&page=${page}`;
    this.httpClient.get<{ message: string, posts: any, count: number}>('http://localhost:3000/api/posts' + queryParams)
      .pipe(map((postData) => {
        return { posts: postData.posts.map((post) => {
          return {
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath,
            user: post.user
          };
        }), count: postData.count};
      }))
      .subscribe(
      (postData) => {
        this.posts = postData.posts;
        this.count = postData.count;
        this.postsUpdated.next({ posts: [...this.posts], count: this.count });
      }
    );
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.httpClient
      .get<{_id: string, title: string, content: string, imagePath: string, user: string}>('http://localhost:3000/api/posts/' + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.httpClient.post<{message: string, post: any}>('http://localhost:3000/api/posts', postData)
      .pipe(map((response) => {
        return {
          id: response.post._id,
          title: response.post.title,
          content: response.post.content,
          imagePath: response.post.imagePath,
          user: response.post.user
        };
      }))
      .subscribe((addedPost) => {
        this.posts.push(addedPost);
        this.count = this.count + 1;
        this.postsUpdated.next({ posts: [...this.posts], count: this.count });
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = { id: id, title: title, content: content, imagePath: image, user: null};
    }
    this.httpClient.put('http://localhost:3000/api/posts/' + id, postData)
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        const post: Post = {id: id, title: title, content: content, imagePath: '', user: ''};
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next({ posts: [...this.posts], count: this.count });
        this.router.navigate(['/']);
      });

  }

  deletePost(id: string) {
    return this.httpClient.delete('http://localhost:3000/api/posts/' + id);
  }
}
