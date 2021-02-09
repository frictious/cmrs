const   mongoose                = require("mongoose");

const wardSchema = new mongoose.Schema({
    name : String, //Ward name
    description : String, //Use CKEDITOR
    hod : String, //Name of Head of Department
    noOfBeds : Number
});

module.exports = mongoose.model("Ward", wardSchema);