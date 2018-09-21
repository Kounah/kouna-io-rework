#!/usr/bin/env node

'use strict';

const readline = require('readline');
const process = require('process');
const mongoose = require('mongoose');
const config = require('../config');
const commander = require('commander');
const User = require('../app/models/user');
const question = require('../app/lib/question');
const colors = require('colors');

mongoose.connect(config.database.connectUrl, {
  useNewUrlParser: true
});

commander
.version('0.1.0')
.option('-u, --username <user>', 'specifies the username as database search query argument')
.option('-t, --tag <tag>', 'specifies the tag as database search query argument')
.option('-e, --email <email>', 'specifies the email as database search query argument')
.option('-q, --query <JSONQuery>', 'generic database search query')
.option('-p, --property <property>', 'the property that should be modified')
.option('-v, --value <value>', 'the value the given property should be set to (requires -p)')
.option('-l, --list', 'lists all users matching your query')
.option('--pretty', 'pretty listing')
.action(function(cmd) {
  var query;
  try { query = cmd.query ? JSON.parse(cmd.query) : {}; }
  catch (error) { console.error(error); query = {}; }

  if(cmd.username) query.username = cmd.username;
  if(cmd.tag) query.tag = cmd.tag;
  if(cmd.email) query.email = cmd.email;

  User.find(query).exec((err, users) => {
    if(err) {
      console.log(err);
      return;
    }

    if(users && users instanceof Array && users.length > 0) {

      if(cmd.list) {
        users.forEach(function(user, userI) {
          if(!cmd.pretty) {
            process.stdout.write(JSON.stringify(user) + '\n');
          } else {
            console.log(user);
          }
        })
        process.exit(0);
      }

      if(cmd.property && cmd.value) {
        console.log(`you are about to set the property "${cmd.property}" to value "${cmd.value}" for ${users.length} users.`);
        var rl = readline.createInterface(process.stdin, process.stdout);

        (function askToProceed() {
          rl.question('Are you sure to proceed? (Y/N) ', question.yesNo(
            function() {
              users.forEach((user, userI) => {
                var drawUserCountLength = (users.length + '').length;
                var msg = [
                  `\r[${' '.repeat(drawUserCountLength - ('' + (userI+1)).length) + (userI+1)}/${users.length}] `,
                  user._id,
                  ` oldValue: "${user[cmd.property]}"`
                ].join('');

                user[cmd.property] = cmd.value;
                user.save((err, newU) => {
                  var result;
                  if(err) {
                    result = '[FAIL]';
                    return;
                  }

                  result = '[SUCCESS]'
                  process.stdout.write(`\r${msg}${' '.repeat(process.stdout.columns - msg.length - result.length)}${result.bold.bgCyan.white}`);
                  if(userI+1 == users.length) {
                    var finished = '[COMPLETE]';
                    process.stdout.write(`\r${finished.bgGreen.white.bold}${' '.repeat(process.stdout.columns - finished.length)}\n`);
                    process.exit(0);
                  }
                })

              });
            },
            function() {
              console.log('cancelled');
            },
            function() {
              console.log('invalid answer, try again.');
              askToProceed();
            }
          ))
        })()
      }
    }
  })
})
.parse(process.argv);