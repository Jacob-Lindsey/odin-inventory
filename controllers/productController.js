var Product = require('../models/product');
var Category = require('../models/category');
var async = require('async');
var mongoose = require('mongoose');

exports.product_list = function(req, res, next) {
    Product.find()
        .populate('brand')
        .populate('category')
        .exec(function(err, list_products) {
            if (err) {
                next(err);
            }
            res.render('product_list', {
                title: 'All',
                products_list: list_products,
            });
        });
};

