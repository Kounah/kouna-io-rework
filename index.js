'use strict';

const fs = require('fs');
const path = require('path');
const process = require('process');

const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

const filesize = require('filesize');

const routes = require('./app/routes');
const config = require('./config');

var handlebars =  expressHbs.create({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    json: function(context) {
      return JSON.stringify(context, null, '  ');
    },
    filesize: function(context) {
      return filesize(context);
    }
  }
});


var app = express();

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.raw());

routes(app);

app.listen(config.app.port);