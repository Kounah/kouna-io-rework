const fs = require('fs');
const path = require('path');
const colors = require('colors');

var m = fs.readdirSync(__dirname)
  .filter(d => {return d != 'index.js'})
  .map(d => {
    return {
      name: d,
      module: require('./' + d)
    };
  })
  .filter(d => {return typeof d.module == 'function'});

module.exports = function(app) {
  m.forEach(m => {
    console.log('executing', m.name.bold, (typeof m.module).italic);
    m.module(app);
  });

  app.get('/*', (req, res) => {
    res.sendStatus(404, {
      path: req.path
    });
  })

  app.post('/*', (req, res) => {
    res.sendStatus(405, {
      path: req.path
    });
  });

  app.put('/*', (req, res) => {
    res.sendStatus(405, {
      path: req.path
    });
  });
}