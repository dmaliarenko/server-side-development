var bodyParser = require('body-parser');
var express = require('express');
var favouriteRouter = express.Router();
var Dishes = require('../models/dishes');
var Favourites = require('../models/favourites');
var Verify = require('./verify');
favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.get(Verify.verifyOrdinaryUser,function(req,res,next){
        Favourites.find({"postedBy":req.decoded._doc._id})
          .populate('postedBy')
          .populate('dishes')
          .exec(function(err,favourite){
          if(err) throw err;
          res.json(favourite);
        });
})

.post(Verify.verifyOrdinaryUser, function(req,res,next){
  Favourites.find({"postedBy":req.decoded._doc._id}).exec(function(err, favourite){
    if(err) throw err;
    if(favourite.length === 0){
        req.body.postedBy = req.decoded._doc._id;
        req.body.dishes = req.body._id;
        req.body._id = null;
        Favourites.create(req.body,function(err, favouriteDish){
          if(err) throw err;
          res.json(favouriteDish);
          });
    }else{
      var dish = favourite[0];
      dish.dishes.push(req.body._id);
      dish.save(function(err, favourite){
        if(err) throw err;
        res.json(favourite);
      });
    }
  });
})

.delete(Verify.verifyOrdinaryUser, function(req,res,next){
  Favourites.find({"postedBy":req.decoded._doc._id}).exec(function(err, favourite){
    if(err) throw err;
    if(favourite.length === 0){
      res.json(favourite);
    }else{
        if(favourite[0].dishes.length > 0){
          favourite[0].remove(function(err, result){
            if(err) throw err;
            res.writeHead(200, {
              'Content-Type': 'text/plain'
            });
            res.end("Deleted all Favourites");
          });
        }
    }
  });
});

favouriteRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function(req,res,next){
  Favourites.find({"postedBy":req.decoded._doc._id}).exec(function(err, favourite){
    if(err) throw err;
    var index = favourite[0].dishes.indexOf(req.params.dishId);
    if(index > -1){
      favourite[0].dishes.splice(index,1);
      favourite[0].save(function(err,favourite){
        if(err) throw err;
        res.json(favourite);
      });
    }
    else{
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end("No such Dish");
    }
  });
});

module.exports = favouriteRouter;
