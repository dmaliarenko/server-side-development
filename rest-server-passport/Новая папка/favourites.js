var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favouriteSchema = new Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dishes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'dish'
  }],
  },
  {
    timestamps: true
  }
);

var Favourites = mongoose.model('favourite', favouriteSchema);
module.exports = Favourites;
