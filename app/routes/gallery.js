const util = require('../lib/util');
const uuid5 = require('uuid/v5');
const config = require('../../config');
const User = require('../models/user');
const Image = require('../models/image');

module.exports = function(app) {
  app.get('/gallery', (req, res) => {
    var page = req.query.page ? req.query.page : 0;
    if(typeof page != 'number') page = 0;

    util.isLoggedIn(req, loggedIn => {
      if(loggedIn) {
        User.findOne(req.session.user, (err, user) => {
          if(err) {
            console.log(err);
            res.sendStatus(500);
          }

          if(user) {
            Image.find({ownerId: user._id})
            .select([
              'ownerId', 'name', '_id', 'cDate', 'mDate', 'md5'
            ])
            .sort({cDate: 1})
            .skip(config.gallery.maxPerPage * page)
            .limit(config.gallery.maxPerPage)
            .exec((err, images) => {
              if(err) {
                console.log(err);
                res.sendStatus(500);
                return;
              }

              if(images) {
                res.render('gallery', {
                  user:   req.session.user,
                  page:   page,
                  images: images
                });
              }
            })
          }
        })
      } else {
        res.render('gallery', {
          page: page
        })
      }
    })
  });

  app.post('/gallery/image', (req, res) => {

    if(req.files.image) {
      util.isLoggedIn(req, loggedIn => {
        if(loggedIn) {
          Image.findOne({md5: req.files.image.md5}).count((err, count) => {
            if(err) {
              console.log(err);
              res.sendStatus(500);
              return;
            }

            if(count > 0) {
              res.sendStatus(409);
            } else {
              var img = new Image();
              img.name      = req.files.image.name;
              img.data      = req.files.image.data;
              img.encoding  = req.files.image.encoding;
              img.mimetype  = req.files.image.mimetype;
              img.md5       = req.files.image.md5;
              img.cDate     = Date();
              img.mDate     = Date();

              User.findOne(req.session.user, (err, user) => {
                if(err) {
                  console.log(err);
                  res.sendStatus(500);
                  return;
                }

                if(user) {
                  img.ownerId = user._id;
                  img.save((err, newImg) => {
                    if(err) {
                      console.log(err);
                      res.sendStatus(500);
                      return;
                    }

                    if(newImg) {
                      res.status(201).json(newImg);
                    }
                  })
                } else {
                  res.sendStatus(401);
                }
              })
            }
          })

        } else {
          res.sendStatus(401)
        }
      })
    } else {
      res.sendStatus(400);
    }
  });

  app.get('/gallery/image/:imageId', (req, res) => {
    Image.findById(req.params.imageId, (err, img) => {
      if(err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      if(img) {
        res.status(200).type(img.mimetype).send(img.data);
      } else {
        res.sendStatus(404);
      }
    })
  })
}