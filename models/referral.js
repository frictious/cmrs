const   mongoose                    = require("mongoose");

const referralSchema = new mongoose.Schema({
    referralID : String,
    childID : String,
    referredTo : String,//Specialists to whom the child's case has been referred to
    fromClinic : String,
    toClinic : String,
    date : {
        type : Date,
        default : Date.now()
    },
    time : String
});

module.exports = mongoose.model("Referral", referralSchema);