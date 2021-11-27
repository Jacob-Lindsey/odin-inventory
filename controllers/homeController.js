var Category = require('../models/category');
var Product = require('../models/product');
var categoryController = require('../controllers/categoryController');
var async = require('async');

exports.index = function(req, res) {

    async.parallel(
        {
            product_count: function(callback) {
                Product.countDocuments({}, callback);
            },
            category_count: function(callback) {
                Category.countDocuments({}, callback);
            },
        },
        function(err, results) {
            res.render('index', {
                title: 'Home',
                error: err,
                data: results,
            });
        }
    );
};
