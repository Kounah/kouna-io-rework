const path = require('path');
const fs = require('fs');
const sass = require('sass');
const colors = require('colors');

console.log('[compiling sass]'.bold);
var variants = fs.readdirSync(path.join(__dirname, 'src/sass'))
.map(e => { return path.parse(path.join(__dirname, 'src/sass', e)); })
.filter(e => { return e.ext == '.scss'; })
.forEach(e => {
  var f = path.join( e.dir, e.base);
  var o = path.join(__dirname, 'dist/css', path.format({name: e.name, ext: '.css'}));

  console.log(f.cyan.dim, 'started.')
  sass.render({
    file: f
  }, function(err, result) {
    if(err) {
      console.log(f.cyan.dim, 'ended. ', 'FAIL'.red);
      console.log(err);
    }

    if(result.css) {
      fs.writeFileSync(o, '' + result.css);
      console.log(f.cyan.dim, 'ended. ', 'SUCCESS'.green);
    }
  })
})

module.exports = {
  mode: 'development',
  entry: {
    'client': path.join(__dirname, 'src/js', 'client/index.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: __dirname + '/dist/js'
  },
}