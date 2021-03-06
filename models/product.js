var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 5000 },
  inStock: { type: Number, max: 9999, min: 0 },
  price: { type: Number, max: 999999, min: 0 },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  brand: {type: String, maxlength: 100 },
});

ProductSchema.virtual("url").get(function () {
  return "/product/" + this._id;
});

//Export model
module.exports = mongoose.model("Product", ProductSchema);