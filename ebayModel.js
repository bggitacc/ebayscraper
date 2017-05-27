/* INSTRUCTOR ONLY (18.3.02)
 *
 * Example model
 * ===================================== */
// First, we hook mongoose into the model with a require
var mongoose = require("mongoose");
// Then, we save the mongoose.Schema class as simply "Schema"
var Schema = mongoose.Schema;
// With our new Schema class, we instantiate an ExampleSchema object
// This is where we decide how our data must look before we accept it in the server, and how to format it in mongoDB
var ExampleSchema = new Schema({
  // string must be a string. We "trim" it to remove any trailing white space
  // Notice that it is required, as well. It must be entered or else mongoose will throw an error
  title: {
    type: String,
    trim: true,
    required: "String is Required"
  },
  // This must be a unique number in the collection, and it must be entered
  link: {
    type: String,
    trim: true,
    required: "String is Required"
  },
  // This will only take a string that looks like an email
  // It must match the regex before it's accepted
  image: {
    type: String,
    match: "String is Required"
  },
 price: {
    type: String,
    match: "String is Required"
  },
  itemid: {
    type: Number,
    unique: true,
    required: true
  },
     sold: {
    type: String,
    match: "String is Required"
  },
  notes: {
    type: String,
    match: "String is Required"
  }
});
// This creates our model from the above schema, using mongoose's model method
var Example = mongoose.model("Example", ExampleSchema);
// Finally, we export the module, allowing server.js to hook into it with a require statement
module.exports = Example;