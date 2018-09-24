const mongoose = require('mongoose');

var imageSchema = mongoose.Schema({
  ownerId:        String,
  public:         Boolean,
  name:           String,
  data:           Buffer,
  encoding:       String,
  mimetype:       String,
  md5:            String,
  cDate:          Date,
  mData:          Date
})

module.exports = mongoose.model('Image', imageSchema);