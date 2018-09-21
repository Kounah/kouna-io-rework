const PREFIX = '/account';
const User = require('../models/user');
const recaptcha = require('../lib/recaptcha');
const bcrypt = require('bcrypt');
const config = require('../../config');
const util = require('../lib/util');

module.exports = function(app) {
  var loginOgData = {
    title: 'kouna.io login page',
    type: 'website',
    description: 'Login to your existing kouna.io account to use all features brought to you by kouna.io.'
  };

  app.get(`${PREFIX}/login`, (req, res) => {
    util.isLoggedIn(req, function(loggedIn) {
      if(loggedIn) {
        res.redirect(`${PREFIX}/profile`);
      } else {
        res.render('account/login', {
          ogData: loginOgData
        })
      }
    })
  })

  app.get(`${PREFIX}/register`, (req, res) => {
    util.isLoggedIn(req, function(loggedIn) {
      if(loggedIn) {
        res.redirect(`${PREFIX}/profile`);
      } else {
        res.render('account/register', {
          ogData: {
            title: 'kouna.io register page',
            type: 'website',
            description: 'You do not have any kouna.io account? No reason to be upset here is where you can change this.'
          }
        })
      }
    })
  })

  app.get(`${PREFIX}/profile`, (req, res) => {
    util.isLoggedIn(req, function(loggedIn) {
      if(loggedIn) {
        res.render('account/profile', {
          user: req.session.user,
          modifySettings: req.query.modifySettings
        })
      } else {
        res.redirect(`${PREFIX}/login`);
      }
    })
  })

  app.post(`${PREFIX}/register`, (req, res) => {
    recaptcha.verify(req, (err, result) => {
      console.log(result);

      if(err || !(result && result.success && result.success == true)) {
        console.log(err);
        res.sendStatus(401);
      }

      if(result.success) {
        if(req.body.password === req.body['repeat-password']) {
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
              var user = new User();
              user.username = req.body.username;
              user.email = req.body.email;
              user.password = hash;
              user.firstName = req.body.firstName;
              user.lastName = req.body.lastName;

              function makeRandomTag() {
                var curTag = "";
                for(i = 0; i < 4; i++) {
                  curTag += Math.trunc(Math.random() * 10)
                }
                return curTag;
              }

              function tryTag(callback) {
                var myTag = makeRandomTag();
                User.findOne({
                  username: req.body.username,
                  tag: myTag
                }).exec((err, u) => {
                  if(err) {
                    console.log(err);
                    return;
                  }

                  if(u) tryTag(callback);
                  else callback(myTag);
                })
              }

              tryTag(tag => {
                user.tag = tag;

                user.save((err, savedU) => {
                  if(err) {
                    console.log(err);
                    return;
                  }

                  req.session.user = savedU;
                  req.session.save((err) => {
                    console.log(err);
                  })

                  console.log(req.session);

                  res.redirect(`${PREFIX}/profile`)
                })
              })
            })
          })
        } else {
          res.sendStatus(401);
        }
      }
    })
  })

  app.post(`${PREFIX}/login`, (req, res) => {
    var searchObj = {};

    function doIt() {
      User.findOne(searchObj).exec((err, user) => {
        if(err) {
          res.render('account/login', {
            ogData: loginOgData,
            error: {
              login: 'Some error happened as we tried to process your request.'
            }
          })
        }

        if(user) {
          bcrypt.compare(req.body.password, user.password)
          .then(result => {
            if(result) {
              console.log(user);

              req.session.user = user;
              res.redirect(`${PREFIX}/profile`);
            } else {
              res.status(401).render('account/login', {
                ogData: loginOgData,
                error: {
                  password: 'Username/Email or Password are incorrect.'
                }
              })
            }
          })
          .catch(err => {
            res.status(500).render('error', {
              error: err
            })
          })
        } else {
            res.status(401).render('account/login', {
            ogData: loginOgData,
            error: {
              login: 'Nothing found. Make sure to Register an account before trying to login.'
            }
          })
        }

      })
    }

    if(config.regex.email.test(req.body.login)) {
      searchObj.email = req.body.login;
      doIt();
    } else if(config.regex.usernameAndTag.test(req.body.login)) {
      searchObj.username = req.body.login.split('#')[0];
      searchObj.tag = req.body.login.split('#')[1];
      doIt();
    } else {
      res.status(401).render('account/login', {
        ogData: loginOgData,
        error: {
          login: 'Wrong pattern for Username or Email'
        }
      })
    }
  })

  app.get('/api/user/id/:userId/settings', (req, res) => {
    if(req.session.user) {
      User.findOne({
        _id: req.session.user._id,
        password: req.session.user.password
      }, (err, user) => {
        if(err) {
          res.sendStatus(500);
          return;
        }

        if(user) {
          User.findById(req.params.userId, (err, targetUser) => {
            if(err) {
              res.sendStatus(500);
              return;
            }

            if(targetUser) {
              if('' + targetUser._id == '' + user._id || util.isAdmin(user)) {
                res.render('api/user/{userId}/settings', {
                  user: user,
                  targetUser: targetUser
                })
              } else {
                res.sendStatus(403);
              }
            } else {
              res.sendStatus(404);
            }
          })
        } else {
          res.sendStatus(401);
        }
      })
    } else {
      res.sendStatus(401);
    }
  })

  app.post('/api/user/id/:userId/settings', (req, res) => {
    if(req.session.user) {
      User.findOne({
        _id: req.session.user._id,
        password: req.session.user.password
      }, (err, user) => {
        if(err) {
          res.sendStatus(500);
          return;
        }

        if(user) {
          User.findById(req.params.userId, (err, targetUser) => {
            if(err) {
              res.sendStatus(500);
              return;
            }

            if(targetUser) {
              if('' + targetUser._id == '' + user._id || util.isAdmin(user)) {
                Object.keys(config.userSettings).forEach(key => {
                  if(config.userSettings[key] == Boolean) {
                    targetUser.settings[key] = req.body[key] ? true : false;
                  } else /* if(config.userSettings[key] == String) */ {
                    targetUser.settings[key] = req.body[key];
                  }
                });

                targetUser.save((err, newTu) => {
                  if(err) {
                    res.sendStatus(500);
                    return;
                  }

                  if(newTu) {
                    if(newTu._id + '' == user._id) {
                      req.session.user = newTu;
                      user = newTu;
                    }
                    res.render('api/user/{userId}/settings', {
                      user: user,
                      targetUser: newTu,
                      admin: util.isAdmin(user),
                      changed: true
                    })
                  }
                })
              }
            } else {
              res.sendStatus(404);
            }
          })
        } else {
          res.sendStatus(401);
        }
      })
    }
  })

  app.post('/api/user/id/:userId/avatar', (req, res) => {
    if(req.session.user) {
      console.log(req.headers);
      console.log(req.body);
      console.log(req.files);

      User.findOne({
        _id: req.session.user._id,
        password: req.session.user.password
      }, (err, user) => {
        if(err) {
          res.sendStatus(500);
          return;
        }

        User.findById(req.params.userId, (err, targetUser) => {
          if(err) {
            res.sendStatus(500);
            return;
          }

          if(targetUser) {
            if('' + targetUser._id == '' + user._id || util.isAdmin(user)) {
            }
          }
        })
      })
    }
  })
}