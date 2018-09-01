const express = require('express');
const multer = require('multer');

const router = express.Router();

const Post = require('../models/post');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if(isValid) {
      error = null;
    }

    callback(error, "backend/images");
  },
  filename: (request, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];

    callback(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post('', multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename
  });
  post.save().then( (result) => {
    res.status(201).json({
      message: 'Post sent',
      post: result
    });
  });
});

router.get('', (req, res, next) => {
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
    });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: 'Post not found'
      });
    }
  });
});


router.put('/:id', multer({storage: storage}).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');

    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  Post.findOneAndUpdate({_id: req.params.id}, post).then((result) => {
    console.log(result);
    res.status(200).json({
      message: 'Post updated',
      post: post
    });
  });
});

router.delete('/:id', (req, res, next) => {
  Post.deleteOne({_id: req.params.id}).then((result) => {
    console.log(result);
    res.status(200).json({
      message: 'Post deleted'
    });
  });
});

module.exports = router;
