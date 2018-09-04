const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');
const SALT_WORK_FACTOR = 10;

const UserSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true}
});

UserSchema.plugin(uniqueValidator);

UserSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', UserSchema);
