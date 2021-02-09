const   mongoose                = require("mongoose");

const admissionSchema = new mongoose.Schema({
    admissionID : String,
    ward : String,
    bedNumber : Number,
    admittedDate : {
        type : Date,
        default : Date.now()
    },
    childID : String,
    admissionDetail : String,//Detail regarding why the child was admitted
    specialist : String,
    wardDescription : String,
    dischargedDate: {
        type: Date,
        default : Date.now()
    },
    dischargedTime : String
});

module.exports = mongoose.model("Admission", admissionSchema);