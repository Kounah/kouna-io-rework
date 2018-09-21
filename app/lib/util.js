const User = require('../models/user');

function isLoggedIn(req, callback) {
  if(req.session.user) {
    User.findOne({
      _id: req.session.user._id,
      password: req.session.user.password
    }).exec((err, u) => {
      if(err) {
        callback(false);
      }

      if(u != null) {
        callback(true);
      } else {
        callback(false);
      }
    })
  } else {
    callback(false);
  }
}

function redirectIfNotLoggedIn(req, res, redirect, callback) {
  isLoggedIn(req, function(loggedIn) {
    if(loggedIn) {
      callback();
    } else {
       res.redirect(redirect);
    }
  })
}

function isAdmin(user) {
  if(user && user.roles && user.roles instanceof Array) {
    return user.roles.includes('system-administrator');
  } else {
    return false;
  }
}

module.exports = {
  isLoggedIn,
  redirectIfNotLoggedIn,
  isAdmin
}