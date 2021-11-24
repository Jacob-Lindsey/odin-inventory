var Category = require('../models/category');
var Product = require('../models/product');
var async = require('async');

const { body, check, validationResult } = require('express-validator');

var mongoose = require('mongoose');

exports.category_list = function(req, res, next) {
    Category.find().exec(function (err, list_categories) {
        if (err) {
            return next(err);
        }
        res.render('category_list', {
            title: "Categories",
            category_list: list_categories,
        });
    });
};

exports.category_detail = function(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        let err = new Error("Invalid ObjectID");
        err.status = 404;
        return next(err);
    }
    async.parallel(
        {
            category: function(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            category_products: function(callback) {
                Product.find({ category: req.params.id })
                    .populate("category")
                    .populate("brand")
                    .exec(callback)
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            }
            if (results.category == null) {
                var err = new Error("Category not found");
                err.status = 404;
                return next(err);
            }
            res.render("product_list", {
                title: results.category.name,
                name: results.category.name,
                category: results.category,
                products_list: results.category_products,
            });
        }
    );
};

exports.category_create_get = function(req, res, next) {
    res.render("category_form", {
        title: "Create a new category",
        isUpdating: false,
    });
};

exports.category_create_post = [
    body("name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Category name required"),
    body("description").optional({ checkFalsy: true }),

    check("name").escape(),
    check("description").escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render("category_form", {
                title: "Create a new category",
                category: req.body,
                isUpdating: false,
                errors: errors.array(),
            });
            return;
        } else {
            var category = new Category({
                name: req.body.name,
                description: req.body.description,
            });
            category.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect(category.url);
            });
        }
    },
];

exports.category_update_post = [
    body("name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Category name required"),
    body("description").optional({ checkFalsy: true }),

    (req, res, next) => {
        var category = new Category({
            name: req.body.name,
            description: req.body.description,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            res.render("category_form", {
                title: "Update Category",
                category: category,
                isUpdating: true,
                errors: errors.array(),
            });
            return;
        } else {
            Category.findByIdAndUpdate(
                req.params.id,
                category,
                {},
                function(err, thecategory) {
                    if (err) {
                        return next(err);
                    }
                    res.redirect(thecategory.url);
                }
            );
        }
    },
];