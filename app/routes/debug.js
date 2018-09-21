const PREFIX = '/debug';

module.exports = function(app) {
  app.get(`${PREFIX}/printMySession`, (req, res) => {
    res.status(200).render('debug/printMySession', {
      user: req.session.user,
      session: req.session
    })
  })

  app.get(`${PREFIX}/sessionTest`, (req, res) => {
    if(req.session.views) {
      req.session.views++;
    } else req.session.views = 1;

    res.status(200).render('debug/sessionTest', {
      user: req.session.user,
      session: req.session
    })
  })
}