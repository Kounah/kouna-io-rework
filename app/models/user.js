const mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username:       String,
  tag:            String,
  email:          String,
  emailValidated: Boolean,
  password:       String,
  firstName:      String,
  lastName:       String,
  birthDate:      Date,
  settings: {
    useDarkTheme: Boolean
  },
  roles: [
    {type: String}
  ]
})

module.exports = mongoose.model('User', userSchema);