const   mongoose            = require("mongoose");

const deliverySchema = new mongoose.Schema({
    deliveryID : String,
    childID : String,
    fatherID : String,
    motherID : String,
    placeOfDelivery : String,
    typeOfDelivery : String,//Whether normal/natural or CS
    deliveryRegDate : {
        type : Date,
        default : Date.now()
    },
    dateDelivered : {
        type : Date,
        default : Date.now()
    },
    timeOfDelivery : String,
    registrationCentre : String,
    deliveredBy: String //Name of Doctor / midwife / nurse in charge
});

module.exports = mongoose.model("Delivery", deliverySchema);