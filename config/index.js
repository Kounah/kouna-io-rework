const fs = require('fs');
const path = require('path');
const process = require('process');

var m = fs.readdirSync(__dirname)
  .filter(d => {return d != 'index.js'})
  .map(d => {return {name: path.parse(d).name, module: require('./' + d)}});

var config = {};

m.forEach(d => {
  if(process.env.verbose == true) console.log('building config ...', d);
  config[d.name] = d.module;
});

module.exports = config;