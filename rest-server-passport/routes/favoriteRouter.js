// Node module named favoriteRouter.js that implements the Express router
// for the /favorites REST API end point

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Verify = require('./verify');

var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.all(Verify.verifyOrdinaryUser)

.get(function (req, res, next) {
    Favorites.find({"postedBy": req.decoded._doc._id}) //only his (self) autorship
        .populate('postedBy')
        .populate('dishes')
        .exec(function (err, favorites) {
        if (err) throw err;
        res.json(favorites);
    });
})

.post(function (req, res, next) {
    Favorites.findOne({postedBy: req.decoded._doc._id}, function (err, favorites) {
        if (err) return next(err);

        if (!favorites) {
             Favorites.create({postedBy: req.decoded._doc._id, dishes: [req.body._id]}, function(err, favorites) {
                 if (err) throw err;
                 favorites.save(function (err, favorites) {
                     if (err) throw err;
                     console.log('Favorites created!');
                     res.json(favorites);
                 });
             });
        } else {
            if (favorites.dishes.indexOf(req.body._id) == -1) {
                favorites.dishes.push(req.body._id);
                favorites.save(function (err, favorites) {
                    if (err) throw err;
                    console.log('Favorites was updated!');
                    res.json(favorites);
                });
            } else {
/*
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.end('Favorites already exists');
*/
                console.log('Favorites already exists!');
                res.json(favorites);

            }

        }
    });
})

.delete(function (req, res, next) {
    Favorites.remove({postedBy: req.decoded._doc._id}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});



favoriteRouter.route('/:dishId')
.all(Verify.verifyOrdinaryUser)

.delete(function (req, res, next) {
    Favorites.findOne({postedBy: req.decoded._doc._id}, function (err, favorites) {
        if (err) throw err;
        for (var i = (favorites.dishes.length - 1); i >= 0; i--) {
            if (favorites.dishes[i] == req.params.dishId) {
                favorites.dishes.splice(i, 1);
            }
        }
        favorites.save(function (err, favorites) {
            if (err) throw err;
/*
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Dish was deleted from favorites!');
*/
            console.log('Dish was deleted from favorites!');
            res.json(favorites);
        });
    });
});

module.exports = favoriteRouter;
