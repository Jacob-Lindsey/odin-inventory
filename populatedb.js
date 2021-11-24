#! /usr/bin/env node

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Category = require('./models/category');
var Product = require('./models/product');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = [];
var products = [];

function categoryCreate(name, description, cb) {
  categorydetail = {name:name, description:description}
  
  var category = new Category(categorydetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category)
  }  );
}

function productCreate(name, description, inStock, price, category, brand, cb) {
  var product = new Product({ 
    name: name,
    description: description,
    inStock: inStock,
    price: price,
    category: category,
    brand: brand
  });
       
  product.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Product: ' + product);
    products.push(product)
    cb(null, product);
  }   );
}

function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate('6-String', 'Description for 6 string', callback);
        },
        function(callback) {
            categoryCreate('7-String', 'Description for 7 string', callback);
        },
        function(callback) {
            categoryCreate('8-String', 'Description for 8 string', callback);
        },
        function(callback) {
            categoryCreate('9-String', 'Description for 9 string', callback);
        },
        function(callback) {
            categoryCreate('10-String', 'Description for 10 string', callback);
        },
        function(callback) {
            categoryCreate('12-String', 'Description for 12 string', callback);
        },
        ],
        // optional callback
        cb);
}


function createProducts(cb) {
    async.parallel([
        function(callback) {
          productCreate('6 String Yamaha', 'Description for 6 String Yamaha', 5, 1299, categories[0], 'Yamaha', callback);
        },
        function(callback) {
            productCreate('8 String Ibanez', 'Description for 8 String Ibanez', 3, 599, categories[2], 'Ibanez', callback);
        },
        function(callback) {
            productCreate('7 String Jackson', 'Description for 7 String Jackson', 1, 345, categories[1], 'Jackson', callback);
        },
        function(callback) {
            productCreate('9 String Legator', 'Description for 9 String Legator', 7, 695, categories[3], 'Legator', callback);
        },
        function(callback) {
            productCreate('12 String Martin', 'Description for 12 String Martin', 12, 2999, categories[5], 'Martin', callback);
        },
        function(callback) {
            productCreate('10 String Schecter', 'Description for 10 String Schecter', 16, 906, categories[4], 'Schecter', callback);
        },
        function(callback) {
          productCreate('7 String Schecter', 'Description for 7 String Schecter', 16, 906, categories[1], 'Schecter', callback);
        },
        function(callback) {
          productCreate('9 String Ibanez', 'Description for 9 String Ibanez', 16, 906, categories[3], 'Ibanez', callback);
        },
        function(callback) {
          productCreate('12 String Fender', 'Description for 12 String Fender', 16, 906, categories[5], 'Fender', callback);
        },
        function(callback) {
          productCreate('6 String Gibson', 'Description for 6 String Gibson', 16, 906, categories[0], 'Gibson', callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createCategories,
    createProducts
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disc database
    mongoose.connection.close();
});



