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

exports.product_detail = function(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        let err = new Error("Invalid ObjectID");
        err.status = 404;
        return next(err);
    }
    Product.findById(req.params.id)
        .populate("category")
        .populate("brand")
        .exec(function(err, product) {
            if (err) {
                next(err);
            }
            if (product == null) {
                let err= new Error(
                    "Product not found."
                );
                err.status = 404;
                return next(err);
            }

            res.render("product_detail", {
                title: product.name,
                product: product,
                category: product.category,
                brand: product.brand,
            });
        });
};

exports.product_create_get = function(req, res, next) {
    res.render("product_form", {
        title: "Create a new product",
        isUpdating: false,
    });
};
