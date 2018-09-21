const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

module.exports = function(app) {
  app.get('/resources*', (req, res) => {
    var p = path.relative('/resources/', req.path);
    var realP = path.join(__dirname, '../../dist', p);

    if(fs.existsSync(realP)) {
      var stat = fs.lstatSync(realP);

      if(stat.isFile()) {
        res.status(200).sendFile(realP);
      }

      if(stat.isSymbolicLink()) {
        res.status(200).sendFile(realP);
      }

      if(stat.isDirectory()) {

        var dir = fs.readdirSync(realP);
        var dirInfo = dir.map(d => {
          return {
            name: d,
            path: path.join(p, d),
            lstat: fs.lstatSync(path.join(realP, d))
          }
        });

        function byNameProperty(a, b) {
          return a.name == b.name
            ? 0
            : a.name > b.name
              ? 1
              : -1;
        }

        var files = dirInfo.filter(d => { return d.lstat.isFile() })
          .sort(byNameProperty);
        var directories = dirInfo.filter( d => { return d.lstat.isDirectory() })
          .sort(byNameProperty);
        var symlinks = dirInfo.filter(d => { return d.lstat.isSymbolicLink() })
          .sort(byNameProperty);

        res.status(200).type('text/html').render('directory', {
          user: req.user,
          ogData: {
            title: `Content of ${req.path}`,
            type: 'website',
            description: `${req.path} (${dirInfo.length} elements)\\nFiles: ${files.length}\\nDirectories: ${directories.length}\\nSymlinks: ${symlinks.length}`,
          },
          config: require('../../config').siteDefaults,
          directories: directories,
          files: files,
          dirname: p,
          parent: (par = path.join(req.path, '..')) != '/' ? par : undefined,
          symlinks: symlinks
        })
      }
    } else {
      res.sendStatus(404);
    }
  })
}