const Post = require('../models/post');

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    user: req.userData.userId
  });
  post.save()
    .then((result) => {
      res.status(201).json({
        message: 'Post sent',
        post: result
      });
    })
    .catch((error) => {
      rest.status(500).json({
        message: 'Creation of post failed'
      })
    });
};
exports.getPosts = (req, res, next) => {
  const postsPerPage = +req.query.postsPerPage;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let posts;
  if (postsPerPage && currentPage) {
    postQuery
      .skip(postsPerPage * (currentPage - 1))
      .limit(postsPerPage);
  }
  postQuery.find()
    .then((documents) => {
      posts = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: 'Posts',
        posts: posts,
        count: count
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Fetching post failed'
      });
    });
};
exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          message: 'Post not found'
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Fetching post failed'
      });
    });
};
exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');

    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    user: req.userData.userId
  });
  Post.findOneAndUpdate({_id: req.params.id, user: req.userData.userId}, post)
    .then((result) => {
      if (result.n === 0) {
        res.status(401).json({
          message: 'Not authorized.'
        })
      } else {
        res.status(200).json({
          message: 'Post updated',
          post: post
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Post not updated'
      })
    });
};
exports.deletePost = (req, res, next) => {
  Post.deleteOne({_id: req.params.id, user: req.userData.userId})
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({
          message: 'Post Deleted',
        });
      } else {
        res.status(401).json({
          message: 'Not authorized.'
        })
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Post not deleted.'
      })
    });
};
