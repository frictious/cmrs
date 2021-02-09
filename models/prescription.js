const   mongoose                    = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    doneBy : String, //Name / ID of person that did entered the prescription
    prescription : String, //Use CKEDITOR to enter the prescription for the child
    created : {
        type : Date,
        default : Date.now()
    },
    childID : String,//ID of the child for whom the prescription was made
    sickness : String//The sickness for which the prescription was done
});

module.exports = mongoose.model("Prescription", prescriptionSchema);