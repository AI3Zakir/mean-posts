import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {

  private mode = 'CREATE';
  private id: string;
  private authStatusSubscription: Subscription;
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  serverUrl = environment.apiUrl;

  constructor(public postsService: PostsService,
              public route: ActivatedRoute,
              private authService: AuthService) {}

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'CREATE') {
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postsService.updatePost(this.id, this.form.value.title, this.form.value.content, this.form.value.image);
    }
    this.form.reset();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      'title': new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      'content': new FormControl(null, {validators: [Validators.required]}),
      'image': new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id')) {
        this.mode = 'EDIT';
        this.id = paramMap.get('id');
        this.isLoading = true;
        this.postsService.getPost(this.id).subscribe((post) => {
          this.isLoading = false;
          this.post = {
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath,
            user: post.user
          };
          this.form.setValue({
            'title': this.post.title,
            'content': this.post.content,
            'image': this.post.imagePath
          });
          this.imagePreview = this.serverUrl + this.post.imagePath;
        });
      } else {
        this.mode = 'CREATE';
        this.id = null;
      }
    });
    this.authStatusSubscription = this.authService.getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
  }

  onImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  ngOnDestroy(): void {
    this.authStatusSubscription.unsubscribe();
  }
}
