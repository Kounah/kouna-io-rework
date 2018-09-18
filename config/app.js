const process = require('process');

module.exports = {
  port: process.env.port ? process.env.port : 1337
}