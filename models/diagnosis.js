const   mongoose                = require("mongoose");

const diagnosisSchema = new mongoose.Schema({
    diagnosedBy : String, //Name of person that diagnosed the child
    diagnosis : String, //Use CKEDITOR to add diagnosis info
    created : {
        type : Date,
        default : Date.now()
    },
    childID : String
});

module.exports = mongoose.model("Diagnoses", diagnosisSchema);