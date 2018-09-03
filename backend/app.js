const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');

const app = express();

mongoose.connect("mongodb+srv://" + process.env.MONGO_ATLAS_USER + ":" + process.env.MONGO_ATLAS_PW + "@meanapp-bsxii.mongodb.net/test?retryWrites=true", { useNewUrlParser: true }).then(() => {
  console.log('Succesfully connected to MongoDB')
}).catch((error) => {
  console.log(error);
  console.error('Connection to MongoDB is not successful')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use('/images', express.static(path.join('backend/images')));

app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, authorization");
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);

module.exports = app;
