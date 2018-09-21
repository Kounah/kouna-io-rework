'use strict';

const fs = require('fs');
const path = require('path');
const process = require('process');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const expressHbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');

const mongoose = require('mongoose');

const filesize = require('filesize');

const routes = require('./app/routes');
const config = require('./config');
const util = require('./app/lib/util')

mongoose.connect(config.database.connectUrl, {
  useNewUrlParser: true
});

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
    },
    ifAdmin: function(user, options) {
      var fnIsAdmin = options.fn;
      var fnNoAdmin = options.inverse;

      return util.isAdmin(user) ? fnIsAdmin(this) : fnNoAdmin(this);
    }
  }
});


var app = express();

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.raw());

app.use(cookieParser(config.app.cookieParserSecret));

app.use(expressFileUpload());

app.set('trust proxy', 1) // trust first proxy

app.response.sendStatus = function(code, data) {
  if(typeof data != 'object') {
    data = {};
  }

  data.code = code;
  data.message = config.statusCodes[code];

  this.status(code).render('statusCode', data);
}

var expressSess = {
  secret: config.app.expressSessionSecret,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 },
}

if(app.get('env') === 'production') {
  app.set('trust proxy', 1);
  expressSession.secure = true;
}

app.use(expressSession(expressSess));

routes(app);

app.listen(config.app.port);