const process = require('process');

module.exports = {
  port: process.env.port ? process.env.port : 1337,
  cookieParserSecret: 'this is basically not secret at all because this code is on github',
  expressSessionSecret: 'what would you write here if there is some secret required and you do not really care about it?'
}