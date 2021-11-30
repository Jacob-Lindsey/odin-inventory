var Product = require('../models/product');
var Category = require('../models/category');
var async = require('async');
var mongoose = require('mongoose');

const { body, validationResult } = require("express-validator");

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
    async.parallel(
        {
            categories: function(callback) {
                Category.find().exec(callback);
            },
        },
        function(err, results) {
            if (err) {
                next(err);
            }
            res.render("product_form", {
                title: "Create a new product",
                categories: results.categories,
                isUpdating: false,
            });
        }
    );
};

exports.product_create_post = [
    body("name", "Product name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),
    body("price", "Price must be between $0 and $999999")
        .isFloat({
            min: 0,
            max: 999999,
        }),
    body("description", "Product description is required")
        .trim()
        .isLength({ min: 1})
        .escape(),
    body("inStock", "Stock must be between 0 and 9999")
        .customSanitizer(value => value || 0)
        .isFloat({
            min: 0,
            max: 9999
        }),
    body("brand", "Product brand is required").trim().escape(),
    body("category").escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        var product = new Product({
            name: req.body.name,
            description: req.body.description,
            inStock: req.body.inStock,
            price: req.body.price,
            category: req.body.category,
            brand: req.body.brand,
        });

        if (!errors.isEmpty()) {
            async.parallel(
                {
                    categories: function(callback) {
                        Category.find().exec(callback);
                    },
                },
                function(err, results) {
                    if (err) {
                        return next(err);
                    }
                    res.render("product_form", {
                        title: "Create a new product",
                        categories: results.categories,
                        product: product,
                        errors: errors.array(),
                    });
                }
            );
            return;
        } else {
            product.save(function(err) {
                if (err) {
                    return next(err);
                }
                res.redirect(product.url);
            });
        }
    },
];

exports.product_delete_get = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        let err = new Error("Invalid ObjectID");
        err.status = 404;
        return next(err);
    }
    Product.findById(req.params.id)
        .populate("category")
        .exec(function (err, product) {
            if (err) {
                next(err);
            }
            if (product == null) {
                let err = new Error(
                    "Product not found."
                );
                err.status = 404;
                return next(err);
            }
            res.render("product_delete", {
                title: "Delete product: " + product.name,
                product: product,
                category: product.category,
            });
        });
};

exports.product_delete_post = function (req, res, next) {
    Product.findByIdAndRemove(req.body.id, function deleteProduct(err) {
        if (err) {
            return next(err);
        };
        res.redirect("/products");
    });
};

exports.product_update_get = function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        let err = new Error("Invalid ObjectID");
        err.status = 404;
        return next(err);
    }
    async.parallel(
        {
            product: function(callback) {
                Product.findById(req.params.id)
                    .populate("category")
                    .exec(callback);
            },
            categories: function(callback) {
                Category.find().exec(callback);
            },
        },
        function(err, results) {
            if (err) {
                return next(err);
            };
            if (results.product == null) {
                let err = new Error(
                    "Product not found."
                );
                err.status = 404;
                return next(err);
            }

            res.render("product_form", {
                title: "Update Product",
                product: results.product,
                categories: results.categories,
                isUpdating: true,
            });
        }
    );
};

exports.product_update_post = [
    body("name", "Product name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),
    body("price", "Price must be between $0 and $999999")
        .isFloat({
            min: 0,
            max: 999999,
        }),
    body("description", "Product description is required")
        .trim()
        .escape(),
    body("inStock", "Stock must be between 0 and 9999")
        .customSanitizer(value => value || 0)
        .isFloat({
            min: 0,
            max: 9999
        }),
    body("brand", "Product brand is required").trim().escape(),
    body("category").escape(),

    (req, res, next) => {
        // TODO: Add password protection, if pw wrong: error ->  else: execute code
        const errors = validationResult(req);
        var product = new Product({
            name: req.body.name,
            description: req.body.description,
            inStock: req.body.inStock,
            price: req.body.price,
            category: req.body.category,
            brand: req.body.brand,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            async.parallel(
                {
                    categories: function(callback) {
                        Category.find().exec(callback);
                    },
                },
                function(err, results) {
                    if (err) {
                        return next(err);
                    }
                    res.render("product_form", {
                        title: "Create a new product",
                        categories: results.categories,
                        product: product,
                        errors: errors.array(),
                    });
                }
            );
            return;
        } else {
            Product.findByIdAndUpdate(
                req.params.id,
                product,
                {},
                function(err, theproduct) {
                    if (err) {
                        return next(err);
                    }
                    if (theproduct) {
                        res.redirect(theproduct.url);
                    } else {
                        let err = new Error(
                            "Product not found."
                        );
                        err.status = 404;
                        return next(err);
                    }
                }
            );
        }
    },
];