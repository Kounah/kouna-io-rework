const fs = require('fs');
const path = require('path');

var exp = {};
var dir = fs.readdirSync(__dirname)
  .filter(d => d != 'index.js')
  .map(d => {
    return {
      name: path.parse(d).name,
      module: require('./' + d)
    }
  })
  .forEach(d => {
    exp[d.name] = d.module;
  });

module.exports = exp;
