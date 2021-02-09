const   express             = require("express"),
        passport            = require("passport"),
        bcrypt              = require("bcryptjs"),
        User                = require("../models/user"),
        Child               = require("../models/child"),
        Father              = require("../models/father"),
        Mother              = require("../models/mother"),
        Guardian            = require("../models/guardian"),
        Admission           = require("../models/admission"),
        Emergency           = require("../models/emergency"),
        Waiting             = require("../models/waiting"),
        Visitors            = require("../models/visitors"),
        Referral            = require("../models/referral"),
        Delivery            = require("../models/delivery"),
        Deceased            = require("../models/deceased"),
        Diagnosis           = require("../models/diagnosis"),
        Prescription        = require("../models/prescription"),
        Test                = require("../models/test"),
        Ward                = require("../models/ward"),
        mongoose            = require("mongoose"),
        nodemailer          = require("nodemailer"),
        crypto              = require("crypto"),
        path                = require("path"),
        multer              = require("multer"),
        Grid                = require("gridfs-stream"),
        GridFsStorage       = require("multer-gridfs-storage");
// const prescription = require("../models/prescription");

const router = express.Router();

//CONFIG
require("dotenv").config();
const transporter = nodemailer.createTransport({
    service : "gmail",
    auth: {
        type : "login",
        user : "childrensmedicalrecords@gmail.com",
        pass : "oladurin"
    }
});

//Handling files
const URI = process.env.MONGODB;
global.Promise = mongoose.Promise
const conn = mongoose.createConnection(URI, {
    useUnifiedTopology : true,
    useNewUrlParser : true,
    useFindAndModify: false
});

//GRIDFS CONFIG FOR IMAGES
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("files");
});

//GRIDFS STORAGE CONFIG
const storage = new GridFsStorage({
    url: URI,
    options : {useUnifiedTopology : true},
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
            if (err) {
                return reject(err);
            }
            const filename = buf.toString('hex') + path.extname(file.originalname);
            const fileInfo = {
                filename: filename,
                bucketName: "files"
            };
            resolve(fileInfo);
            });
        });
    }
});

//Multer config for images
const files = multer({ storage });

//Login checker
const isLoggedIn = ((req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
});

//==========================================================================================
//ROUTES
//Root Route
router.get("/", isLoggedIn, (req, res) => {
    res.render("dashboard", {
        title : "OLA DURIN CHILDREN'S MEDICAL RECORDS",
        description: "Ola Durin Children's Medical Records System"
    });
});

//==========================================================================================
//STAFF ROUTES
//Registration Route
router.get("/register", isLoggedIn, (req, res) => {
    res.render("register", {
        title : "Add New User",
        description : "Add a new user to the system"
    });
    // if(req.user.role === "Admin"){
    //     res.render("register", {
    //         title : "Add New User",
    //         description : "Add a new user to the system"
    //     });
    // }else{
    //     console.log("YOU ARE NOT AN ADMINISTRATOR");
    //     res.redirect("back");
    // }
});

//Registration Route Logic
router.post("/register", (req, res) => {
    if(req.body.password === req.body.rePassword){
        bcrypt.genSalt(10)
        .then(salt => {
            bcrypt.hash(req.body.password, salt)//Encrypting the password
            .then(hash => {
                User.create({
                    name : req.body.name,
                    email : req.body.email,
                    password : hash,
                    role : req.body.role
                })
                .then(user => {
                    if(user){
                        if(req.body.role === "Admin"){
                            const mailOptions = {
                                from : "user@gmail.com",
                                to : req.body.email,
                                subject : "Login Information",
                                html : `<p>Dear ${req.body.name},</p> <p>Hope this mail finds you well.</p><p>You have been successfully registered into the Ola Durin Childrens Medical Record System.</p><p>Here are your login credentials.</p><h3>Credentials:</h3><p>Email: <strong>${req.body.email}</strong></p><p>Password: <strong>${req.body.password}</strong></p><p>You have been registered as an Admin, meaning you have full rights to manage the system</p><p>Regards</p>Management</p>`
                            }
                            transporter.sendMail(mailOptions)
                            .then(mail => {
                                if(mail){
                                    req.flash("success", "LOGIN INFORMATION SENT SUCCESSFULLY");
                                }else{
                                    req.flash("error", "LOGIN INFORMATION NOT SENT");
                                }
                            })
                        }else{
                            const mailOptions = {
                                from : "user@gmail.com",
                                to : req.body.email,
                                subject : "Login Information",
                                html : `<p>Dear ${req.body.name},</p> <p>Hope this mail finds you well.</p><p>You have been successfully registered into the Ola Durin Childrens Medical Record System.</p><p>Here are your login credentials.</p><h3>Credentials:</h3><p>Email: <strong>${req.body.email}</strong></p><p>Password: <strong>${req.body.password}</strong></p><p>You have been registered as an Matron, meaning you can only add data and information into the system</p><p>Regards</p>Management</p>`
                            }
                            transporter.sendMail(mailOptions)
                            .then(mail => {
                                if(mail){
                                    req.flash("success", "LOGIN INFORMATION SENT SUCCESSFULLY");
                                }else{
                                    req.flash("error", "LOGIN INFORMATION NOT SENT");
                                }
                            })
                        }
                        console.log(user);
                        req.flash("success", "ACCOUNT CREATED SUCCESSFULLY");
                        res.redirect("back");
                    }
                })
                .catch(err => {
                    if(err){
                        console.log(err);
                        res.redirect("back");
                    }
                })                
            })
        })
    }
});

//Login Route
router.get("/login", (req, res) => {
    res.render("login", {
        title : "Login to the system",
        description : "Logging in to the Ola Durin Childrens Medical Records System"
    });
});

//Login Route Logic
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect : "/",
        successFlash : true,
        failureRedirect : "/login",
        failureFlash : true
    })(req, res, next);
});

//Logout Route
router.get("/logout", isLoggedIn, (req, res) => {
    req.logout();
    req.flash("success", "Logged out Successfully"),
    res.redirect("/login");
});

//About Route
router.get("/about", isLoggedIn, (req, res) => {
    res.render("about", {
        title : "About the Developers",
        description : "Know about the developers"
    });
});

//Data-Entry Route
router.get("/data-entry", isLoggedIn, (req, res) => {
    res.redirect("/child/add");
});

//Index Route
router.get("/index", isLoggedIn, (req, res) => {
    res.render("index", {
        title : "Ola Durin Childrens Medical Records Index Page",
        description : "Index Page"
    });
});

//Profile Route
router.get("/profile/:id", isLoggedIn, (req, res) => {
    User.findOne({_id : req.params.id})
    .then(admin => {
        if(admin){
            res.render("profile", {
                title : "User profile page",
                description : "View/Change profile info",
                admin : admin
            });
        }
    })
    .catch(err => {
        if(err){
            console.log(err)
            res.redirect("back");
        }
    })
});

//Profile Update Route
router.put("/profile/:id", (req, res) => {
    if((req.body.password !== "") && (req.body.password === req.body.rePassword)){
        bcrypt.genSalt(10)
        .then(salt => {
            bcrypt.hash(req.body.password, salt)
            .then(hash => {
                User.findOneAndUpdate({_id : req.params.id}, {
                    name : req.body.name,
                    email : req.body.email,
                    password : hash
                })
                .then(updated => {
                    if(updated){
                        req.flash("success", "PROFILE UPDATED SUCCESSFULLY");
                        res.redirect("back");
                    }
                })
                .catch(err => {
                    if(err){
                        console.log(err)
                        res.redirect("back");
                    }
                });
            })
        })

    }else{
        User.findOneAndUpdate({_id : req.params.id}, {
            name : req.body.name,
            email : req.body.email
        })
        .then(updated => {
            if(updated){
                console.log("PROFILE UPDATED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err)
                res.redirect("back");
            }
        });
    }

});

//Getting users
router.get("/users", (req, res) => {
    User.find({})
    .then(users => {
        if(users){
            res.render("users", {
                title : "Showing all registered users",
                description : "Showing all registered users in the system",
                users : users
            })
        }
    })
})

//Admin Account Delete Route
router.delete("/user/:id", (req, res) => {
    User.findOneAndDelete({_id : req.params.id})
    .then(deletedUser => {
        if(deletedUser){
            req.flash("success", "USER ACCOUNT DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });

});

//END OF STAFF ROUTES
//==========================================================================================

//==========================================================================================
//DATA CRUD FUNCTIONALITY AREA
//==========================================================================================
//Search Area
router.get("/viewSearch", isLoggedIn, (req, res) => {
    res.render("viewSearch", {
        title : "Search area",
        description : "Searching for a record"
    });
});

//Edit Search
router.get("/editSearch", isLoggedIn, (req, res) => {
    res.render("editSearch", {
        title : "Search area",
        description : "Searching for a record"
    });
});

//Delete Search
router.get("/deleteSearch", isLoggedIn, (req, res) => {
    res.render("deleteSearch", {
        title : "Search area",
        description : "Searching for a record to delete"
    });
});

//Report Search
router.get("/reportSearch", isLoggedIn, (req, res) => {
    res.render("reportSearch", {
        title : "Report Search area",
        description : "Searching for a record"
    });
});

//Search form logic
router.post("/viewSearch", (req, res) => {
    if(req.body.options === "Child"){
        Child.findOne({childID : req.body.search})
        .then(child => {
            if(child){
                res.redirect(`/child/${child._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    }else if(req.body.options === "Mother"){
        Mother.findOne({childId : req.body.search})
        .then(mother => {
            if(mother){
                res.redirect(`/mother/${mother._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Father"){
        Father.findOne({childId : req.body.search})
        .then(father => {
            if(father){
                res.redirect(`/father/${father._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Guardian"){
        Guardian.findOne({childId : req.body.search})
        .then(guardian => {
            if(guardian){
                res.redirect(`/guardian/${guardian._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Admission"){
        Admission.findOne({childID : req.body.search})
        .then(admission => {
            if(admission){
                res.redirect(`/admission/${admission._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Emergency"){
        Emergency.findOne({childID : req.body.search})
        .then(emergency => {
            if(emergency){
                res.redirect(`/emergency/${emergency._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Waiting"){
        Waiting.findOne({childID : req.body.search})
        .then(waiting => {
            if(waiting){
                res.redirect(`/waiting/${waiting._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Visitors"){
        res.redirect(`/visitor/${req.body.search}`);
    }else if(req.body.options === "Referral"){
        Referral.findOne({childID : req.body.search})
        .then(referral => {
            if(referral){
                res.redirect(`/referral/${referral._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Delivery"){
        Delivery.findOne({childID : req.body.search})
        .then(delivery => {
            if(delivery){
                res.redirect(`/delivery/${delivery._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Deceased"){
        Deceased.findOne({childId : req.body.search})
        .then(deceased => {
            if(deceased){
                res.redirect(`/deceased/${deceased._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }
});

//Search form logic
router.post("/editSearch", (req, res) => {
    if(req.body.options === "Child"){
        Child.findOne({childID : req.body.search})
        .then(child => {
            if(child){
                res.redirect(`/child/${child._id}/edit`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    }else if(req.body.options === "Mother"){
        Mother.findOne({childId : req.body.search})
        .then(mother => {
            if(mother){
                res.redirect(`/mother/${mother._id}/edit`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Father"){
        Father.findOne({childId : req.body.search})
        .then(father => {
            if(father){
                res.redirect(`/father/${father._id}/edit`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Guardian"){
        Guardian.findOne({childId : req.body.search})
        .then(guardian => {
            if(guardian){
                res.redirect(`/guardian/${guardian._id}/edit`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Admission"){
        Admission.findOne({childID : req.body.search})
        .then(admission => {
            if(admission){
                res.redirect(`/admission/${admission._id}/edit`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Emergency"){
        Emergency.findOne({childID : req.body.search})
        .then(emergency => {
            if(emergency){
                res.redirect(`/emergency/${emergency._id}/edit`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Waiting"){
        Waiting.findOne({childID : req.body.search})
        .then(waiting => {
            if(waiting){
                res.redirect(`/waiting/${waiting._id}/edit`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Visitors"){
        res.redirect(`/visitor/${req.body.search}/editVisitors`);
    }else if(req.body.options === "Referral"){
        Referral.findOne({childID : req.body.search})
        .then(referral => {
            if(referral){
                res.redirect(`/referral/${referral._id}/edit`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Delivery"){
        Delivery.findOne({childID : req.body.search})
        .then(delivery => {
            if(delivery){
                res.redirect(`/delivery/${delivery._id}/edit`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Deceased"){
        Deceased.findOne({childId : req.body.search})
        .then(deceased => {
            if(deceased){
                res.redirect(`/deceased/${deceased._id}/edit`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }
});

//Search form logic
router.post("/deleteSearch", (req, res) => {
    if(req.body.options === "Child"){
        Child.findOne({childID : req.body.search})
        .then(child => {
            if(child){
                res.render("deleteChild", {
                    title : "Deleting child record",
                    description : "Deleting a single child record",
                    child : child
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    }else if(req.body.options === "Mother"){
        Mother.findOne({childId : req.body.search})
        .then(mother => {
            if(mother){
                res.render("deleteMother", {
                    title : "Deleting mothers record",
                    description : "Deleting a single mothers record",
                    mother : mother
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Father"){
        Father.findOne({childId : req.body.search})
        .then(father => {
            if(father){
                res.render("deleteFather", {
                    title : "Deleting father record",
                    description : "Deleting a single father record",
                    father : father
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Guardian"){
        Guardian.findOne({childId : req.body.search})
        .then(guardian => {
            if(guardian){
                res.render("deleteGuardian", {
                    title : "Deleting guardian record",
                    description : "Deleting a single guardian record",
                    guardian : guardian
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Admission"){
        Admission.find({childID : req.body.search})
        .then(admissions => {
            if(admissions){
                res.render("deleteAdmissions", {
                    title : "Showing childs admissions",
                    description : "Deleting a single child admission record",
                    admissions : admissions
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Emergency"){
        Emergency.find({childID : req.body.search})
        .then(emergencies => {
            if(emergencies){
                res.render("deleteEmergencies", {
                    title : "Showing childs emergency records",
                    description : "Deleting a single child emergency record",
                    emergencies : emergencies
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Waiting"){
        Waiting.find({childID : req.body.search})
        .then(waitings => {
            if(waitings){
                res.render("deleteWaitings", {
                    title : "Showing childs waiting records",
                    description : "Deleting a single child waiting record",
                    waitings : waitings
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Visitors"){
        Visitors.find({childID : req.body.search})
        .then(visitors => {
            if(visitors){
                res.render("deleteVisitor", {
                    title : "Showing childs visitor records",
                    description : "Deleting a single child visitor record",
                    visitors : visitors
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Referral"){
        Referral.find({childID : req.body.search})
        .then(referrals => {
            if(referrals){
                res.render("deleteReferral", {
                    title : "Showing childs referral records",
                    description : "Deleting a single child referral record",
                    referrals : referrals
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Test"){
        Test.find({childID : req.body.search})
        .then(tests => {
            if(tests){
                res.render("deleteTests", {
                    title : "Showing childs test records",
                    description : "Deleting a single child test record",
                    tests : tests
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Prescription"){
        Prescription.find({childID : req.body.search})
        .then(prescriptions => {
            if(prescriptions){
                res.render("deletePrescription", {
                    title : "Showing childs prescription records",
                    description : "Deleting a single child prescription record",
                    prescriptions : prescriptions
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Diagnosis"){
        Diagnosis.find({childID : req.body.search})
        .then(diagnosis => {
            if(diagnosis){
                res.render("deleteDiagnosis", {
                    title : "Showing childs diagnosis records",
                    description : "Deleting a single child diagnosis record",
                    diagnosis : diagnosis
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Delivery"){
        Delivery.findOne({childID : req.body.search})
        .then(delivery => {
            if(delivery){
                res.render("deleteDelivery", {
                    title : "Showing childs delivery record",
                    description : "Deleting a single child delivery record",
                    delivery : delivery
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Deceased"){
        Deceased.findOne({childId : req.body.search})
        .then(deceased => {
            if(deceased){
                res.render("deleteDeceased", {
                    title : "Showing childs deceased records",
                    description : "Deleting a single child deceased record",
                    deceased : deceased
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }
});

//Report Search form logic
router.post("/reportSearch", (req, res) => {
    if(req.body.options === "Birth Certificate"){
        Delivery.findOne({childID : req.body.search})
        .then(delivery => {
            if(delivery){
                res.redirect(`/birth_certificate/${delivery._id}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    }else if(req.body.options === "Death Certificate"){
        Deceased.findOne({childId : req.body.search})
        .then(deceased => {
            if(deceased){
                res.redirect(`/death_certificate/${deceased.childId}`);
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Test"){
        Test.find({childID : req.body.search})
        .then(tests => {
            if(tests){
                res.render("test_report", {
                    title : "All tests",
                    description : "Showing all tests conducted on child",
                    tests : tests
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Prescription"){
        Prescription.find({childID : req.body.search})
        .then(prescriptions => {
            if(prescriptions){
                res.render("prescription_report", {
                    title : "All prescriptions",
                    description : "Showing all prescriptions given to child",
                    prescriptions : prescriptions
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Admission"){
        Admission.find({childID : req.body.search})
        .then(admissions => {
            if(admissions){
                res.render("admission_report", {
                    title : "All admissions",
                    description : "Showing all the time a child has been admitted",
                    admissions : admissions
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Diagnosis"){
        Diagnosis.find({childID : req.body.search})
        .then(diagnosis => {
            if(diagnosis){
                res.render("diagnosis_report", {
                    title : "All diagnosis",
                    description : "Showing all the time a child has been diagnosed",
                    diagnosis : diagnosis
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Referral"){
        Referral.find({childID : req.body.search})
        .then(referrals => {
            if(referrals){
                res.render("referral_report", {
                    title : "All referrals",
                    description : "Showing all the time a child has been referred",
                    referrals : referrals
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Visitors"){
        Visitors.find({childID : req.body.search})
        .then(visitors => {
            if(visitors){
                res.render("visitors_report", {
                    title : "All visitors",
                    description : "Showing all visitors",
                    visitors : visitors
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }else if(req.body.options === "Waiting"){
        Waiting.find({childID : req.body.search})
        .then(waitings => {
            if(waitings){
                res.render("waiting_report", {
                    title : "All waiting children",
                    description : "Showing all children in the waiting list",
                    waitings : waitings
                });
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("err");
            }
        });
    }
});

// CHILD CRUD FUNCTIONALITY
//Get child add form
router.get("/child/add", isLoggedIn, (req, res) => {
    res.render("addChild", {
        title : "Adding child information form",
        description : "Adding child info into the form"
    });
});

//Adding record in the child document
router.post("/child/add", files.single("photo"), (req, res) => {
    Child.findOne({childID : req.body.childID})
    .then(foundChild => {
        if(foundChild){
            req.flash("error", "ID ALREADY EXIST, PLEASE USE ANOTHER");
            res.redirect("back");
        }else{
            if(req.file !== "" && (req.file.mimetype === "image/png" || req.file.mimetype === "image/jpg" || req.file.mimetype === "image/jpeg")){
                Child.create({
                    childID : req.body.childID,
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    otherName : req.body.otherName,
                    dob : req.body.dob,
                    address : req.body.address,
                    photo : req.file.filename,
                    ethnicity : req.body.ethnicity,
                    religion : req.body.religion,
                    registrationType : req.body.registrationType,
                    regDate : req.body.regDate,
                    gender : req.body.gender,
                    nationality : req.body.nationality
                })
                .then(child => {
                    if(child){
                        req.flash("success", "CHILD ADDED SUCCESSFULLY");
                        res.redirect("back");
                    }
                })
                .catch(err => {
                    if(err){
                        console.log(err);
                        res.redirect("back");
                    }
                });
        
            }else{
                req.flash("error", "FILES MUST BE EITHER .JPG OR .PNG");
                res.redirect("back");
            }

        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    })

});

//Getting one child information
router.get("/child/:id", isLoggedIn, (req, res) => {
    Child.findById({_id : req.params.id})
    .then(child => {
        if(child){
            res.render("viewChild", {
                title : "Child Information",
                description : "Getting the information of a single child",
                child : child
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    })
});

//Viewing one childs information
router.get("/child/:id/edit", isLoggedIn, (req, res) => {
    Child.findById({_id : req.params.id})
    .then(child => {
        if(child){
            res.render("editChild", {
                title : "Child Information",
                description : "Getting the information of a single child",
                child : child
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    })
});

//Updating the child's information
router.put("/child/:id/edit", files.single("photo"), (req, res) => {
    if(req.file !== undefined && (req.file.mimetype === "image/png" || req.file.mimetype === "image/jpg" || req.file.mimetype === "image/jpeg")){
        Child.findOneAndUpdate({_id : req.params.id}, {
            childCode : req.body.childCode,
            childID : req.body.childID,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            otherName : req.body.otherName,
            dob : req.body.dob,
            address : req.body.address,
            photo : req.file.filename,
            ethnicity : req.body.ethnicity,
            religion : req.body.religion,
            registrationType : req.body.registrationType,
            regDate : req.body.regDate,
            gender : req.body.gender,
            nationality : req.body.nationality
        })
        .then(child => {
            if(child){
                req.flash("success", "CHILD INFORMATION UPDATED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    }else{
        Child.findOneAndUpdate({_id : req.params.id}, {
            childCode : req.body.childCode,
            childID : req.body.childID,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            otherName : req.body.otherName,
            dob : req.body.dob,
            address : req.body.address,
            ethnicity : req.body.ethnicity,
            religion : req.body.religion,
            registrationType : req.body.registrationType,
            regDate : req.body.regDate,
            gender : req.body.gender,
            nationality : req.body.nationality
        })
        .then(child => {
            if(child){
                req.flash("success", "CHILD INFORMATION UPDATED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    }

});

//Deleting child information
router.delete("/child/:id", (req, res) => {
    Child.findByIdAndRemove({_id : req.params.id})
    .then(child => {
        if(child){
            gfs.files.findOne({filename : child.photo}, (err, file) => {
                if(file){
                    gfs.files.remove({filename : file.filename, root : "files"}, (err) => {
                        if(err){
                            console.log(err);
                        }else{
                            req.flash("success", "CHILD INFORMATION DELETED SUCCESSFULLY")
                            res.redirect("back");
                        }
                    });
                }else{
                    console.log(err);
                }
            });
        }
    })
});

//END OF CHILD CRUD FUNCTIONALITY

//FATHER CRUD FUNCTIONALITY

//Getting the form for input
router.get("/father/add", isLoggedIn, (req, res) => {
    res.render("addFather", {
        title : "Adding father information form",
        description : "Adding father info into the form"
    });
});

// Adding record in the father document
router.post("/father/add", files.single("photo"), (req, res) => {
    if(req.file !== "" && (req.file.mimetype === "image/png" || req.file.mimetype === "image/jpg" || req.file.mimetype === "image/jpeg")){
        if(req.body.childID !== ""){
            Child.findOne({childID : req.body.childID})
            .then(child => {
                if(child){
                    Father.create({
                        fatherID : req.body.fatherID,
                        firstName : req.body.firstName,
                        lastName : req.body.lastName,
                        otherName : req.body.otherName,
                        gender : req.body.gender,
                        dob : req.body.dob,
                        address : req.body.address,
                        contact : req.body.contact,
                        nationality : req.body.nationality,
                        placeOfBirth : req.body.pob,
                        maritalStatus : req.body.maritalStatus,
                        photo : req.file.filename,
                        childId : req.body.childID,
                        occupation : req.body.occupation,
                        educationalLevel : req.body.educationalLevel,
                        noOfChildren : req.body.noOfChildren,
                        regDate : req.body.regDate
                    })
                    .then(father => {
                        if(father){
                            child.father = father._id;
                            child.save();
                            req.flash("success", "FATHER INFO SAVED SUCCESSFULLY");
                            res.redirect("back");
                        }
                    })
                    .catch(err => {
                        if(err){
                            console.log(err);
                            res.redirect("back");
                        }
                    });
                }else{
                    req.flash("error", "CHILD ID IS NOT IN THE SYSTEM");
                    res.redirect("back");
                }
            })
        }else{
            Father.create({
                fatherID : req.body.fatherID,
                firstName : req.body.firstName,
                lastName : req.body.lastName,
                otherName : req.body.otherName,
                gender : req.body.gender,
                dob : req.body.dob,
                address : req.body.address,
                contact : req.body.contact,
                nationality : req.body.nationality,
                placeOfBirth : req.body.pob,
                maritalStatus : req.body.maritalStatus,
                photo : req.file.filename,
                occupation : req.body.occupation,
                educationalLevel : req.body.educationalLevel,
                noOfChildren : req.body.noOfChildren,
                regDate : req.body.regDate
            })
            .then(father => {
                if(father){
                    req.flash("success", "FATHER INFO SAVED SUCCESSFULLY");
                    res.redirect("back");
                }
            })
            .catch(err => {
                if(err){
                    console.log(err);
                    res.redirect("back");
                }
            });
        }
    }else{
        req.flash("error", "FATHER'S PHOTO IS MANDATORY AND MUST BE EITHER JPG OR PNG");
        res.redirect("back");
    }
});

//Getting one father information
router.get("/father/:id", isLoggedIn, (req, res) => {
    Father.findOne({_id : req.params.id})
    .then(father => {
        if(father){
            res.render("viewFather", {
                title : "Fathers Information",
                description : "Showing fathers information",
                father : father
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
  
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
    
});

//Getting the information for edit
router.get("/father/:id/edit", isLoggedIn, (req, res) => {
    Father.findOne({_id : req.params.id})
    .then(father => {
        if(father){
            res.render("editFather", {
                title : "Fathers Information",
                description : "Showing fathers information",
                father : father
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
  
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

// Updating record in the father document
router.put("/father/:id/edit", files.single("photo"), (req, res) => {
    const type = req.file
    if(type !== undefined && (req.file.mimetype === "image/png" || req.file.mimetype === "image/jpg" || req.file.mimetype === "image/jpeg")){
        Father.findOneAndUpdate({_id : req.params.id}, {
            fatherID : req.body.fatherID,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            otherName : req.body.otherName,
            gender : req.body.gender,
            dob : req.body.dob,
            address : req.body.address,
            contact : req.body.contact,
            nationality : req.body.nationality,
            placeOfBirth : req.body.pob,
            maritalStatus : req.body.maritalStatus,
            photo : req.file.filename,
            childId : req.body.childID,
            occupation : req.body.occupation,
            educationalLevel : req.body.educationalLevel,
            noOfChildren : req.body.noOfChildren,
            regDate : req.body.regDate
        })
        .then(father => {
            if(father){
                req.flash("success", "FATHER INFO UPDATED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });

    }else{
        Father.findOneAndUpdate({_id : req.params.id}, {
            fatherID : req.body.fatherID,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            otherName : req.body.otherName,
            gender : req.body.gender,
            dob : req.body.dob,
            address : req.body.address,
            contact : req.body.contact,
            nationality : req.body.nationality,
            placeOfBirth : req.body.pob,
            maritalStatus : req.body.maritalStatus,
            childId : req.body.childID,
            occupation : req.body.occupation,
            educationalLevel : req.body.educationalLevel,
            noOfChildren : req.body.noOfChildren,
            regDate : req.body.regDate
        })
        .then(father => {
            if(father){
                req.flash("success", "FATHER INFO UPDATED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    }

});

// Deleting father information
router.delete("/father/:id", (req, res) => {
    Father.findById({_id : req.params.id})
    .then(father => {
        if(father){
            gfs.files.findOne({filename : father.photo}, (err, file) => {
                if(file){
                    gfs.files.deleteOne({filename : file.filename}, (err) => {
                        if(err){
                            console.log(err);
                        }else{
                            Father.findOneAndRemove({_id : req.params.id})
                            .then(deleted => {
                                if(deleted){
                                    req.flash("success", "FATHER INFORMATION DELETED SUCCESSFULLY");
                                    res.redirect("back");
                                }
                            })
                        }
                    });
                }else{
                    console.log(err);
                }
            });
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });

});

//END OF FATHER CRUD FUNCTIONALITY

//MOTHER CRUD FUNCTIONALITY
//Getting the form for input
router.get("/mother/add", isLoggedIn, (req, res) => {
    res.render("addMother", {
        title : "Adding mother information form",
        description : "Adding mother info into the form"
    });
});

//Adding record in the mother document
router.post("/mother/add", files.single("photo"), (req, res) => {
    if(req.file !== "" && (req.file.mimetype === "image/png" || req.file.mimetype === "image/jpg" || req.file.mimetype === "image/jpeg")){
        if(req.body.childID !== ""){
            Child.findOne({childID : req.body.childID})
            .then(child => {
                if(child){
                    Mother.create({
                        motherID : req.body.motherID,
                        firstName : req.body.firstName,
                        lastName : req.body.lastName,
                        otherName : req.body.otherName,
                        gender : req.body.gender,
                        dob : req.body.dob,
                        address : req.body.address,
                        contact : req.body.contact,
                        nationality : req.body.nationality,
                        placeOfBirth : req.body.pob,
                        maritalStatus : req.body.maritalStatus,
                        photo : req.file.filename,
                        childId : req.body.childID,
                        occupation : req.body.occupation,
                        educationalLevel : req.body.educationalLevel,
                        noOfChildren : req.body.noOfChildren,
                        regDate : req.body.regDate
                    })
                    .then(mother => {
                        if(mother){
                            child.mother = mother._id;
                            child.save();
                            req.flash("success", "MOTHER INFORMATION ADDED SUCCESSFULLY");
                            res.redirect("back");
                        }
                    })
                    .catch(err => {
                        if(err){
                            console.log(err);
                            res.redirect("back");
                        }
                    });            
                }else{
                    req.flash("error", "CHILD IS NOT IN THE SYSTEM");
                    res.redirect("back");
                }
            })
        }else{
            Mother.create({
                motherID : req.body.motherID,
                firstName : req.body.firstName,
                lastName : req.body.lastName,
                otherName : req.body.otherName,
                gender : req.body.gender,
                dob : req.body.dob,
                address : req.body.address,
                contact : req.body.contact,
                nationality : req.body.nationality,
                placeOfBirth : req.body.pob,
                maritalStatus : req.body.maritalStatus,
                photo : req.file.filename,
                occupation : req.body.occupation,
                educationalLevel : req.body.educationalLevel,
                noOfChildren : req.body.noOfChildren,
                regDate : req.body.regDate
            })
            .then(mother => {
                if(mother){
                    child.mother = mother._id;
                    child.save();
                    console.log("MOTHER INFO ADDED SUCCESSFULLY");
                    res.redirect("back");
                }
            })
            .catch(err => {
                if(err){
                    console.log(err);
                    res.redirect("back");
                }
            });
    
        }
        
    }else{
        console.log("IMAGES MUST BE EITHER JPG OR PNG");
        res.redirect("back");
    }

});

//Getting one mother information
router.get("/mother/:id", isLoggedIn, (req, res) => {
    Mother.findOne({_id : req.params.id})
    .then(mother => {
        if(mother){
            res.render("viewMother", {
                title : "Viewing childs mother information",
                description : "Viewing a single mothers information",
                mother : mother
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });

});

//Getting the form for edit
router.get("/mother/:id/edit", isLoggedIn, (req, res) => {
    Mother.findOne({_id : req.params.id})
    .then(mother => {
        if(mother){
            res.render("editMother", {
                title : "Viewing childs mother information",
                description : "Viewing a single mothers information",
                mother : mother
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

// Updating record in the mother document
router.put("/mother/:id/edit", files.single("photo"), (req, res) => {
    const type = req.file
    if(type !== undefined){
        if(req.file.mimetype === "image/jpg" || req.file.mimetype === "image/png"  || req.file.mimetype === "image/jpeg"){
            Mother.findOneAndUpdate({_id : req.params.id}, {
                motherID : req.body.motherID,
                firstName : req.body.firstName,
                lastName : req.body.lastName,
                otherName : req.body.otherName,
                gender : req.body.gender,
                dob : req.body.dob,
                address : req.body.address,
                contact : req.body.contact,
                nationality : req.body.nationality,
                placeOfBirth : req.body.pob,
                maritalStatus : req.body.maritalStatus,
                photo : req.file.filename,
                childId : req.body.childID,
                occupation : req.body.occupation,
                educationalLevel : req.body.educationalLevel,
                noOfChildren : req.body.noOfChildren,
                regDate : req.body.regDate
            })
            .then(mother => {
                if(mother){
                    req.flash("success", "MOTHER INFORMATION UPDATED SUCCESSFULLY");
                    res.redirect("back");
                }
            })
            .catch(err => {
                if(err){
                    console.log(err);
                    res.redirect("back");
                }
            });
    
        }
    }else{
        Mother.findOneAndUpdate({_id : req.params.id}, {
            motherID : req.body.motherID,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            otherName : req.body.otherName,
            gender : req.body.gender,
            dob : req.body.dob,
            address : req.body.address,
            contact : req.body.contact,
            nationality : req.body.nationality,
            placeOfBirth : req.body.pob,
            maritalStatus : req.body.maritalStatus,
            childId : req.body.childID,
            occupation : req.body.occupation,
            educationalLevel : req.body.educationalLevel,
            noOfChildren : req.body.noOfChildren,
            regDate : req.body.regDate
        })
        .then(mother => {
            if(mother){
                req.flash("success", "MOTHER INFORMATION UPDATED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    }

});

// Deleting mother information
router.delete("/mother/:id", (req, res) => {
    Mother.findById({_id : req.params.id})
    .then(mother => {
        if(mother){
            gfs.files.findOne({filename : mother.photo}, (err, file) => {
                if(file){
                    gfs.files.deleteOne({filename : file.filename, root : "files"}, (err) => {
                        if(err){
                            console.log(err);
                        }else{
                            Mother.findByIdAndDelete({_id : mother._id})
                            .then(deleted => {
                                if(deleted){
                                    req.flash("success", "MOTHER INFORMATION DELETED SUCCESSFULLY");
                                    console.log("FILE DELETED");
                                    res.redirect("back");

                                }
                            })
                        }
                    });
                }else{
                    console.log(err);
                }
            });
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });
});

// END OF MOTHER FUNCTIONALITY

//GUARDIAN CRUD FUNCTIONALITY
//Adding record form
router.get("/guardian/add", isLoggedIn, (req, res) => {
    res.render("addGuardian", {
        title : "Adding guardian info",
        description : "Adding a guardian info into the document"
    });
});

//Adding record in the guardian document
router.post("/guardian/add", files.single("photo"), (req, res) => {
    if(req.file !== "" && (req.file.mimetype === "image/png" || req.file.mimetype === "image/png" || req.file.mimetype === "image/jpeg")){
        if(req.body.childID !== ""){
            Child.findOne({childID : req.body.childID})
            .then(child => {
                if(child){
                    Guardian.create({
                        guardianID : req.body.guardianID,
                        firstName : req.body.firstName,
                        lastName : req.body.lastName,
                        otherName : req.body.otherName,
                        gender : req.body.gender,
                        dob : req.body.dob,
                        address : req.body.address,
                        contact : req.body.contact,
                        nationality : req.body.nationality,
                        placeOfBirth : req.body.pob,
                        maritalStatus : req.body.maritalStatus,
                        photo : req.file.filename,
                        childId : req.body.childID,
                        occupation : req.body.occupation,
                        educationalLevel : req.body.educationalLevel,
                        noOfChildren : req.body.noOfChildren,
                        regDate : req.body.regDate
                    })
                    .then(guardian => {
                        if(guardian){
                            child.guardian = guardian._id;
                            req.flash("success", "GUARDIAN INFORMATION ADDED SUCCESSFULLY");
                            res.redirect("back");
                        }
                    })
                    .catch(err => {
                        if(err){
                            console.log(err);
                            res.redirect("back");
                        }
                    });
            
                }else{
                    req.flash("error", "CHILD IS NOT IN THE SYSTEM");
                    res.redirect("back");
                }
            })
        }
    }else{
        req.flash("error", "IMAGES MUST BE EITHER JPG OR PNG");
        res.redirect("back");
    }

});

//Getting one guardian information
router.get("/guardian/:id", isLoggedIn, (req, res) => {
    Guardian.findOne({_id : req.params.id})
    .then(guardian => {
        if(guardian){
            res.render("viewGuardian", {
                title : "Viewing childs gaurdian information",
                description : "Viewing a single gaurdian information",
                guardian : guardian
            });
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });

});

//Getting the form for edit
router.get("/guardian/:id/edit", isLoggedIn, (req, res) => {
    Guardian.findOne({_id : req.params.id})
    .then(guardian => {
        if(guardian){
            res.render("editGuardian", {
                title : "Viewing childs gaurdian information",
                description : "Viewing a single gaurdian information",
                guardian : guardian
            });
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });

})

// Updating record in the guardian document
router.put("/guardian/:id/edit", files.single("photo"), (req, res) => {
    if(req.file !== undefined && (req.file.mimetype === "image/png" || req.file.mimetype === "image/png" || req.file.mimetype === "image/jpeg")){
        Guardian.findByIdAndUpdate({_id : req.params.id}, {
            guardianID : req.body.gaurdianID,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            otherName : req.body.otherName,
            gender : req.body.gender,
            dob : req.body.dob,
            address : req.body.address,
            contact : req.body.contact,
            nationality : req.body.nationality,
            placeOfBirth : req.body.pob,
            maritalStatus : req.body.maritalStatus,
            photo : req.file.filename,
            childId : req.body.childID,
            occupation : req.body.occupation,
            educationalLevel : req.body.educationalLevel,
            noOfChildren : req.body.noOfChildren,
            regDate : req.body.regDate
        })
        .then(guardian => {
            if(guardian){
                req.flash("success", "GUARDIAN INFO UPDATED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });

    }else{
        Guardian.findOneAndUpdate({_id : req.params.id}, {
            gaurdianID : req.body.gaurdianID,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            otherName : req.body.otherName,
            gender : req.body.gender,
            dob : req.body.dob,
            address : req.body.address,
            contact : req.body.contact,
            nationality : req.body.nationality,
            placeOfBirth : req.body.pob,
            maritalStatus : req.body.maritalStatus,
            childId : req.body.childID,
            occupation : req.body.occupation,
            educationalLevel : req.body.educationalLevel,
            noOfChildren : req.body.noOfChildren,
            regDate : req.body.regDate
        })
        .then(guardian => {
            if(guardian){
                req.flash("success", "GUARDIAN INFO UPDATED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    }
    
});

// Deleting guardian information
router.delete("/guardian/:id", (req, res) => {
    Guardian.findByIdAndDelete({_id : req.params.id})
    .then(guardian => {
        if(guardian){
            gfs.files.findOne({filename : gaurdian.photo}, (err, file) => {
                if(file){
                    gfs.files.remove({filename : file.filename, root : "files"}, (err) => {
                        if(err){
                            console.log(err);
                        }
                    });
                }else{
                    console.log(err);
                }
            });
            req.flash("success", "GUARDIAN INFORMATION DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });
});

// END OF GUARDIAN FUNCTIONALITY

//ADMISSION CRDU FUNCTIONALITY
//Getting the admission form
router.get("/admission/add", isLoggedIn, (req, res) => {
    res.render("addAdmission", {
        title : "Adding admission info",
        description : "Adding childs admission info"
    });
});

//Adding record in the admission document
router.post("/admission/add", (req, res) => {
    if(req.body.childID !== ""){
        Child.findOne({childID : req.body.childID})
        .then(child => {
            if(child){
                Admission.create({
                    admissionID : req.body.admissionID,
                    ward : req.body.ward,
                    bedNumber : req.body.bedNumber,
                    admittedDate : req.body.admittedDate,
                    childID : req.body.childID,
                    admissionDetail : req.body.admissionDetail,
                    specialist : req.body.specialist,
                    dischargedDate: req.body.dischargedDate,
                    dischargedTime : req.body.dischargedTime
                })
                .then(admission => {
                    if(admission){
                        req.flash("success", "CHILD ADMITTED SUCCESSFULLY");
                        res.redirect("back");
                    }
                })
                .catch(err => {
                    if(err){
                        console.log(err);
                        res.redirect("back");
                    }
                });
            
            }
        })
    }else{
        req.flash("error", "CHILD MUST HAVE AN ID");
        res.redirect("back");
    }
    
});

//Getting one admission details
router.get("/admission/:id", isLoggedIn, (req, res) => {
    Admission.findById({_id : req.params.id})
    .then(admission => {
        if(admission){
            res.render("viewAdmission", {
                title : "Child Admission Info",
                description : "Showing a childs admission information",
                admission : admission
            });
        }else{
            console.log("NO RECORD FOUND");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });

});

//Getting the form for edit
router.get("/admission/:id/edit", isLoggedIn, (req, res) => {
    Admission.findById({_id : req.params.id})
    .then(admission => {
        if(admission){
            res.render("editAdmission", {
                title : "Child Admission Info",
                description : "Showing a childs admission information",
                admission : admission
            });
        }else{
            console.log("NO RECORD FOUND");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });
});

//Updating record in the admission document
router.put("/admission/:id/edit", (req, res) => {
    Admission.findByIdAndUpdate({_id : req.params.id}, {
        admissionID : req.body.admissionID,
        ward : req.body.ward,
        bedNumber : req.body.bedNumber,
        admittedDate : req.body.admittedDate,
        childID : req.body.childID,
        admissionDetail : req.body.admissionDetail,
        specialist : req.body.specialist,
        dischargedDate: req.body.dischargedDate,
        dischargedTime : req.body.dischargedTime
    })
    .then(admission => {
        if(admission){
            req.flash("success", "CHILD INFORMATION UPDATED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            req.flash("error", "CHILD INFORMATION UPDATE ERROR");
            res.redirect("back");
        }
    });

});

//Deleting record in the admission document
router.delete("/admission/:id", (req, res) => {
    Admission.findOneAndDelete({_id : req.params.id})
    .then(admission => {
        if(admission){
            req.flash("success", "ADMISSION INFORMATION DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            req.flash("error", "ADMISSION INFORMATION DELETE UNSUCCESSFUL");
            res.redirect("back");
        }
    });

});

// END OF ADMISSION FUNCTIONALITY

//EMERGENCY CRUD FUNCTIONALITY
//Getting the emergency add info form
router.get("/emergency/add", isLoggedIn, (req, res) => {
    res.render("addEmergency", {
        title : "Adding emergency info",
        description : "Adding childs emergency info"
    });
});

//Adding record in the emergency document
router.post("/emergency/add", (req, res) => {
    if(req.body.childID !== ""){
        Child.findOne({childID : req.body.childID})
        .then(child => {
            if(child){
                Emergency.create({
                    emergencyID : req.body.emergencyID,
                    childID : req.body.childID,
                    regDate : req.body.regDate,
                    emergencyDescription : req.body.emergencyDescription,
                    broughtBy : req.body.broughtBy,
                    bringersContact : req.body.bringersContact,
                    relationship : req.body.relationship
                })
                .then(emergency => {
                    if(emergency){
                        req.flash("success", "EMERGENCY INFORMATION ADDED SUCCESSFULLY");
                        res.redirect("back");
                    }
                })
                .catch(err => {
                    if(err){
                        console.log(err);
                        res.redirect("back");
                    }
                });
            
            }
        })
    }else{
        Emergency.create({
            emergencyID : req.body.emergencyID,
            regDate : req.body.regDate,
            emergencyDescription : req.body.emergencyDescription,
            broughtBy : req.body.broughtBy,
            bringersContact : req.body.bringersContact,
            relationship : req.body.relationship
        })
        .then(emergency => {
            if(emergency){
                req.flash("success", "EMERGENCY INFORMATION ADDED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    
    }
});

//Getting one emergency info
router.get("/emergency/:id", isLoggedIn, (req, res) => {
    Emergency.findOne({_id : req.params.id})
    .then(emergency => {
        if(emergency){
            res.render("viewEmergency", {
                title : "Child emergency information",
                description : "Childs emergency information page",
                emergency : emergency
            });
        }
    })
    .catch(err => {
        if(err){
            req.flash("success", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Getting the form for edit
router.get("/emergency/:id/edit", isLoggedIn, (req, res) => {
    Emergency.findOne({_id : req.params.id})
    .then(emergency => {
        if(emergency){
            res.render("editEmergency", {
                title : "Child emergency information",
                description : "Childs emergency information page",
                emergency : emergency
            });
        }
    })
    .catch(err => {
        if(err){
            req.flash("success", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Updating record in the emergency document
router.put("/emergency/:id/edit", (req, res) => {
    Emergency.findByIdAndUpdate({_id : req.params.id}, {
        emergencyID : req.body.emergencyID,
        childID : req.body.childID,
        regDate : req.body.regDate,
        emergencyDescription : req.body.emergencyDescription,
        broughtBy : req.body.broughtBy,
        bringersContact : req.body.bringersContact,
        relationship : req.body.relationship
    })
    .then(emergency => {
        if(emergency){
            req.flash("success", "CHILD INFORMATION UPDATED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR UPDATING CHILD INFORMATION");
            res.redirect("back");
        }
    });

});

//Deleting record in the emergency document
router.delete("/emergency/:id", (req, res) => {
    Emergency.findOneAndDelete({_id : req.params.id})
    .then(emergency => {
        if(emergency){
            req.flash("success", "CHILD EMERGENCY INFORMATION DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR DELETING INFORMATION");
            res.redirect("back");
        }
    });
    
});

// END OF EMERGENCY CRUD FUNCTIONALITY

//WAITING CRUD FUNCTIONALITY
//Getting the waiting add info form
router.get("/waiting/add", isLoggedIn, (req, res) => {
    res.render("addWaiting", {
        title : "Adding waiting info",
        description : "Adding childs waiting info"
    });
});

//Adding record in the waiting document
router.post("/waiting/add", (req, res) => {
    Waiting.create({
        waitingID : req.body.waitingID,
        childID : req.body.childID,
        specialist : req.body.specialist,
        status : req.body.status,
        waitingFor : req.body.waitingFor,
        waitingDate : req.body.waitingDate
    })
    .then(waiting => {
        if(waiting){
            req.flash("success", "CHILD ADDED TO WAITING LIST SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR ADDING CHILD TO WAITING LIST");
            res.redirect("back");
        }
    });

});

//Getting one waiting info
router.get("/waiting/:id", isLoggedIn, (req, res) => {
    Waiting.findOne({_id : req.params.id})
    .then(waiting => {
        if(waiting){
            res.render("viewWaiting", {
                title : "Child waiting information",
                description : "Childs waiting information page",
                waiting : waiting
            });
        }else{
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Getting the form for edit
router.get("/waiting/:id/edit", isLoggedIn, (req, res) => {
    Waiting.findOne({_id : req.params.id})
    .then(waiting => {
        if(waiting){
            res.render("editWaiting", {
                title : "Child waiting information",
                description : "Childs waiting information page",
                waiting : waiting
            });
        }else{
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Updating record in the waiting document
router.put("/waiting/:id/edit", (req, res) => {
    Waiting.findByIdAndUpdate({_id : req.params.id}, {
        waitingID : req.body.waitingID,
        childID : req.body.childID,
        specialist : req.body.specialist,
        status : req.body.status,
        waitingFor : req.body.waitingFor,
        waitingDate : req.body.waitingDate
    })
    .then(waiting => {
        if(waiting){
            req.flash("success", "CHILD INFORMATION UPDATED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR UPDATING CHILD INFORMATION");
            res.redirect("back");
        }
    });

});

//Deleting record in the waiting document
router.delete("/waiting/:id", (req, res) => {
    Waiting.findOneAndDelete({_id : req.params.id})
    .then(waiting => {
        if(waiting){
            req.flash("success", "CHILD WAITING INFORMATION DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR DELETING INFORMATION");
            res.redirect("back");
        }
    });
    
});

//END OF WAITING CRUD FUNCTIONALITY

//VISITORS CRUD FUNCTIONALITY
//Getting the visitors add info form
router.get("/visitors/add", isLoggedIn, (req, res) => {
    res.render("addVisitors", {
        title : "Adding visitors info",
        description : "Adding childs visitor info"
    });
});

//Adding record in the visitors document
router.post("/visitors/add", (req, res) => {
    Visitors.create({
        visitorsID : req.body.visitorsID,
        childID : req.body.childID,
        name : req.body.name,
        purpose : req.body.purpose,
        date : req.body.visitDate
    })
    .then(visitors => {
        if(visitors){
            req.flash("success", "VISITORS INFORMATION ADDED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR ADDING VISITORS INFORMATION");
            res.redirect("back");
        }
    });

});

//Getting all the visitors
router.get("/visitor/:childID", isLoggedIn, (req, res) => {
    Visitors.find({childID : req.params.childID})
    .then(visitors => {
        if(visitors){
            res.render("viewVisitor", {
                title : "Showing all visitors",
                description : "Showing all the childs visitors",
                visitors : visitors
            })
        }
    })
    .catch(err=> {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    })

});

//Getting all the visitors
router.get("/visitor/:childID/editVisitors", isLoggedIn, (req, res) => {
    Visitors.find({childID : req.params.childID})
    .then(visitors => {
        if(visitors){
            res.render("editVisitor", {
                title : "Showing all visitors",
                description : "Showing all the childs visitors",
                visitors : visitors
            })
        }
    })
    .catch(err=> {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    })

});

//Getting one visitors info
router.get("/visitors/:id", isLoggedIn, (req, res) => {
    Visitors.findOne({_id : req.params.id})
    .then(visitors => {
        if(visitors){
            res.render("viewVisitors", {
                title : "Child visitors information",
                description : "Childs visitors information page",
                visitors : visitors
            });
        }else{
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("success", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Getting the form for edit
router.get("/visitors/:id/edit", isLoggedIn, (req, res) => {
    Visitors.findOne({_id : req.params.id})
    .then(visitors => {
        if(visitors){
            res.render("editVisitors", {
                title : "Child visitors information",
                description : "Childs visitors information page",
                visitors : visitors
            });
        }else{
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("success", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Updating record in the visitors document
router.put("/visitors/:id/edit", (req, res) => {
    Visitors.findByIdAndUpdate({_id : req.params.id}, {
        visitorsID : req.body.visitorsID,
        childID : req.body.childID,
        name : req.body.name,
        purpose : req.body.purpose,
        date : req.body.visitDate
    })
    .then(visitors => {
        if(visitors){
            req.flash("success", "CHILD VISITORS INFORMATION UPDATED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR UPDATING INFORMATION");
            res.redirect("back");
        }
    });

});

//Deleting record in the visitors document
router.delete("/visitors/:id", (req, res) => {
    Visitors.findOneAndDelete({_id : req.params.id})
    .then(visitors => {
        if(visitors){
            req.flash("success", "CHILD VISITORS INFO DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });
    
});

//END OF VISITORS CRUD FUNCTIONALITY

//REFERRAL CRUD FUNCTIONALITY
//Getting the referral add info form
router.get("/referral/add", isLoggedIn, (req, res) => {
    res.render("addReferral", {
        title : "Adding referral info",
        description : "Adding childs referral info"
    });
});

//Adding record in the referral document
router.post("/referral/add", (req, res) => {
    Referral.create({
        referralID : req.body.referralID,
        childID : req.body.childID,
        referredTo : req.body.referredTo,
        fromClinic : req.body.fromClinic,
        toClinic : req.body.toClinic,
        date : req.body.date,

    })
    .then(referral => {
        if(referral){
            req.flash("success", "REFERRAL INFO ADDED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR ADDING REFERRAL");
            res.redirect("back");
        }
    });

});

//Getting one referral info
router.get("/referral/:id", isLoggedIn, (req, res) => {
    Referral.findOne({_id : req.params.id})
    .then(referral => {
        if(referral){
            res.render("viewReferral", {
                title : "Child referral information",
                description : "Childs referral information page",
                referral : referral
            });
        }else{
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Getting the form for edit
router.get("/referral/:id/edit", isLoggedIn, (req, res) => {
    Referral.findOne({_id : req.params.id})
    .then(referral => {
        if(referral){
            res.render("editReferral", {
                title : "Child referral information",
                description : "Childs referral information page",
                referral : referral
            });
        }else{
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Updating record in the referral document
router.put("/referral/:id/edit", (req, res) => {
    Referral.findByIdAndUpdate({_id : req.params.id}, {
        referralID : req.body.referralID,
        childID : req.body.childID,
        referredTo : req.body.referredTo,
        fromClinic : req.body.fromClinic,
        toClinic : req.body.toClinic,
        date : req.body.date
    })
    .then(referral => {
        if(referral){
            req.flash("success", "CHILD REFERRAL INFO UPDATED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("success", "ERROR UPDATING REFERRAL INFORMATION");
            res.redirect("back");
        }
    });

});

//Deleting record in the referral document
router.delete("/referral/:id", (req, res) => {
    Referral.findOneAndDelete({_id : req.params.id})
    .then(referral => {
        if(referral){
            req.flash("success", "CHILD REFERRAL INFO DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR DELETING INFORMATION");
            res.redirect("back");
        }
    });
    
});

//END OF REFERRAL CRUD FUNCTIONALITY

//DELIVERY CRUD FUNCTIONALITY
//Getting the delivery add info form
router.get("/delivery/add", isLoggedIn, (req, res) => {
    res.render("addDelivery", {
        title : "Adding delivery info",
        description : "Adding childs delivery info"
    });
});

//Adding record in the delivery document
router.post("/delivery/add", (req, res) => {
    if(req.body.childID !== undefined){
        Child.findOne({childID : req.body.childID})
        .then(child => {
            if(child){
                Delivery.create({
                    deliveryID : req.body.deliveryID,
                    fatherID : req.body.fatherID,
                    motherID : req.body.motherID,
                    placeOfDelivery : req.body.placeOfDelivery,
                    typeOfDelivery : req.body.typeOfDelivery,
                    childID : req.body.childID,
                    deliveryRegDate : req.body.deliveryRegDate,
                    dateDelivered : req.body.dateDelivered,
                    timeOfDelivery : req.body.timeOfDelivery,
                    deliveredBy : req.body.deliveredBy,
                    registrationCentre : req.body.registrationCentre
                })
                .then(delivery => {
                    if(delivery){
                        req.flash("success", "DELIVERY INFO ADDED SUCCESSFULLY");
                        res.redirect("back");
                    }
                })
                .catch(err => {
                    if(err){
                        req.flash("error", "ERROR ADDING DELIVERY INFORMATION");
                        res.redirect("back");
                    }
                });
            
            }
        })
    }else{
        Delivery.create({
            deliveryID : req.body.deliveryID,
            fatherID : req.body.fatherID,
            motherID : req.body.motherID,
            placeOfDelivery : req.body.placeOfDelivery,
            typeOfDelivery : req.body.typeOfDelivery,
            deliveryRegDate : req.body.deliveryRegDate,
            dateDelivered : req.body.dateDelivered,
            timeOfDelivery : req.body.timeOfDelivery,
            deliveredBy : req.body.deliveredBy,
            registrationCentre : req.body.registrationCentre
        })
        .then(delivery => {
            if(delivery){
                console.log("DELIVERY INFO ADDED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });
    
    }
});

//Getting one delivery info
router.get("/delivery/:id", isLoggedIn, (req, res) => {
    Delivery.findOne({_id : req.params.id})
    .then(delivery => {
        if(delivery){
            res.render("viewDelivery", {
                title : "Child delivery information",
                description : "Childs delivery information page",
                delivery : delivery
            });
        }else{
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Getting the form for edit
router.get("/delivery/:id/edit", isLoggedIn, (req, res) => {
    Delivery.findOne({_id : req.params.id})
    .then(delivery => {
        if(delivery){
            res.render("editDelivery", {
                title : "Child delivery information",
                description : "Childs delivery information page",
                delivery : delivery
            });
        }else{
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Updating record in the delivery document
router.put("/delivery/:id/edit", (req, res) => {
    Delivery.findByIdAndUpdate({_id : req.params.id}, {
        deliveryID : req.body.deliveryID,
        fatherID : req.body.fatherID,
        motherID : req.body.motherID,
        placeOfDelivery : req.body.placeOfDelivery,
        typeOfDelivery : req.body.typeOfDelivery,
        childID : req.body.childID,
        deliveryRegDate : req.body.deliveryRegDate,
        dateDelivered : req.body.dateDelivered,
        timeOfDelivery : req.body.timeOfDelivery,
        deliveredBy : req.body.deliveredBy,
        registrationCentre : req.body.registrationCentre
    })
    .then(delivery => {
        if(delivery){
            req.flash("success", "CHILD DELIVERY INFO UPDATED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR UPDATING INFORMATION");
            res.redirect("back");
        }
    });

});

//Deleting record in the delivery document
router.delete("/delivery/:id", (req, res) => {
    Delivery.findOneAndDelete({_id : req.params.id})
    .then(delivery => {
        if(delivery){
            req.flash("success", "CHILD DELIVERY INFO DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR DELETING INFORMATION");
            res.redirect("back");
        }
    });
    
});

//END OF DELIVERY CRUD FUNCTIONALITY

//DECEASED CRUD FUNCTIONALITY
//Getting the delivery add info form
router.get("/deceased/add", isLoggedIn, (req, res) => {
    res.render("addDeceased", {
        title : "Adding deceased info",
        description : "Adding childs deceased info"
    });
});

//Adding record in the deceased document
router.post("/deceased/add", (req, res) => {
    if(req.body.childId !== undefined){
        Child.findOne({childID : req.body.childId})
        .then(child => {
            if(child){
                Deceased.create({
                    deceasedID : req.body.deceasedID,
                    timeOfDeath : req.body.timeOfDeath,
                    date : req.body.date,
                    reportedBy : req.body.reportedBy,
                    causeOfDeath : req.body.causeOfDeath,
                    childId : req.body.childId,
                    residenceAddress : req.body.residenceAddress,
                    assumedAreaOfIncident : req.body.assumedAreaOfIncident,
                    tribe : req.body.tribe,
                    nationality : req.body.nationality,
                    gender : req.body.gender,
                    lastName : req.body.lastName,
                    otherName : req.body.otherName,
                    firstName : req.body.firstName
                })
                .then(deceased => {
                    if(deceased){
                        req.flash("success", "DECEASED INFO ADDED SUCCESSFULLY");
                        res.redirect("back");
                    }
                })
                .catch(err => {
                    if(err){
                        req.flash("error", "ERROR ADDING DECEASED INFORMATION");
                        res.redirect("back");
                    }
                });
            
            }
        })
    }else{
        Deceased.create({
            deceasedID : req.body.deceasedID,
            timeOfDeath : req.body.timeOfDeath,
            date : req.body.date,
            reportedBy : req.body.reportedBy,
            causeOfDeath : req.body.causeOfDeath,
            residenceAddress : req.body.residenceAddress,
            assumedAreaOfIncident : req.body.assumedAreaOfIncident,
            tribe : req.body.tribe,
            nationality : req.body.nationality,
            gender : req.body.gender,
            lastName : req.body.lastName,
            otherName : req.body.otherName,
            firstName : req.body.firstName
        })
        .then(deceased => {
            if(deceased){
                req.flash("success", "DECEASED INFO ADDED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                req.flash("error", "ERROR DELETING DECEASED INFORMATION");
                res.redirect("back");
            }
        });
    
    }
    
});

//Getting one deceased info
router.get("/deceased/:id", isLoggedIn, (req, res) => {
    Deceased.findOne({_id : req.params.id})
    .then(deceased => {
        if(deceased){
            res.render("viewDeceased", {
                title : "Child deceased information",
                description : "Childs deceased information page",
                deceased : deceased
            });
        }else{
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Getting the form for edit
router.get("/deceased/:id/edit", isLoggedIn, (req, res) => {
    Deceased.findOne({_id : req.params.id})
    .then(deceased => {
        if(deceased){
            res.render("editDeceased", {
                title : "Child deceased information",
                description : "Childs deceased information page",
                deceased : deceased
            });
        }else{
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

//Updating record in the deceased document
router.put("/deceased/:id", (req, res) => {
    Deceased.findByIdAndUpdate({_id : req.params.id}, {
        deceasedID : req.body.deceasedID,
        timeOfDeath : req.body.timeOfDeath,
        date : req.body.date,
        reportedBy : req.body.reportedBy,
        causeOfDeath : req.body.causeOfDeath,
        childId : req.body.childId,
        residenceAddress : req.body.residenceAddress,
        assumedAreaOfIncident : req.body.assumedAreaOfIncident,
        tribe : req.body.tribe,
        nationality : req.body.nationality,
        gender : req.body.gender,
        lastName : req.body.lastName,
        otherName : req.body.otherName,
        firstName : req.body.firstName
    })
    .then(deceased => {
        if(deceased){
            req.flash("success", "CHILD DECEASED INFO UPDATED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR UPDATING INFORMATION");
            res.redirect("back");
        }
    });

});

//Deleting record in the deceased document
router.delete("/deceased/:id", (req, res) => {
    Deceased.findOneAndDelete({_id : req.params.id})
    .then(deceased => {
        if(deceased){
            req.flash("success", "CHILD DECEASED INFO DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "ERROR DELETING DECEASED INFORMATION");
            res.redirect("back");
        }
    });
    
});

//END OF DECEASED CRUD FUNCTIONALITY
//==========================================================================================

//==========================================================================================
//TEST CRUD FUNCTIONALITY
//Getting the form for input
router.get("/test/add", isLoggedIn, (req, res) => {
    res.render("addTest", {
        title : "Adding test information form",
        description : "Adding test info into the form"
    });
});

// Adding record in the father document
router.post("/test/add", files.single("labResult"), (req, res) => {
    if(req.file !== "" && (req.file.mimetype === "application/pdf")){
        if(req.body.childID !== ""){
            Child.findOne({childID : req.body.childID})
            .then(child => {
                if(child){
                    Test.create({
                        type : req.body.type,
                        requestedBy : req.body.requestedBy,
                        labResult : req.file.filename,
                        childID : req.body.childID
                    })
                    .then(test => {
                        if(test){
                            req.flash("success", "TEST INFORMATION SAVED SUCCESSFULLY");
                            res.redirect("back");
                        }
                    })
                    .catch(err => {
                        if(err){
                            console.log(err);
                            res.redirect("back");
                        }
                    });
                }else{
                    req.flash("error", "CHILD ID IS NOT IN THE SYSTEM");
                    res.redirect("back");
                }
            })
        }else{
            Test.create({
                type : req.body.type,
                requestedBy : req.body.requestedBy,
                labResult : req.file.filename,
                childID : req.body.childID
            })
            .then(test => {
                if(test){
                    req.flash("success", "TEST INFO SAVED SUCCESSFULLY");
                    res.redirect("back");
                }
            })
            .catch(err => {
                if(err){
                    console.log(err);
                    res.redirect("back");
                }
            });
        }
    }else{
        req.flash("error", "TEST FILE IS MANDATORY AND MUST BE A PDF FILE");
        res.redirect("back");
    }
});

//Getting one test information
router.get("/test/:id", isLoggedIn, (req, res) => {
    Test.findOne({_id : req.params.id})
    .then(test => {
        if(test){
            res.render("viewTest", {
                title : "Test Information",
                description : "Showing test information",
                test : test
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
  
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
    
});

//Getting the information for edit
router.get("/test/:id/edit", isLoggedIn, (req, res) => {
    Test.findOne({_id : req.params.id})
    .then(test => {
        if(test){
            res.render("editTest", {
                title : "Test Information",
                description : "Showing test information",
                test : test
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
  
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

// Updating record in the father document
router.put("/test/:id/edit", files.single("labResult"), (req, res) => {
    const type = req.file
    if(type !== undefined && (req.file.mimetype === "application/pdf")){
        Test.findOneAndUpdate({_id : req.params.id}, {
            type : req.body.type,
            requestedBy : req.body.requestedBy,
            labResult : req.file.filename,
            childID : req.body.childID
        })
        .then(test => {
            if(test){
                req.flash("success", "TEST INFORMATION UPDATED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                console.log(err);
                res.redirect("back");
            }
        });

    }else{
        Test.findOneAndUpdate({_id : req.params.id}, {
            type : req.body.type,
            requestedBy : req.body.requestedBy,
            childID : req.body.childID
        })
        .then(test => {
            if(test){
                req.flash("success", "TEST INFORMATION UPDATED SUCCESSFULLY");
                res.redirect("back");
            }
        })
        .catch(err => {
            if(err){
                req.flash("error", "TEST FILE IS REQUIRED AND MUST BE A PDF");
                res.redirect("back");
            }
        });
    }

});

// Deleting test information
router.delete("/test/:id", (req, res) => {
    Test.findById({_id : req.params.id})
    .then(test => {
        if(test){
            gfs.files.findOne({filename : test.labResult}, (err, file) => {
                if(file){
                    gfs.files.deleteOne({filename : file.filename}, (err) => {
                        if(err){
                            console.log(err);
                        }else{
                            Test.findOneAndRemove({_id : req.params.id})
                            .then(deleted => {
                                if(deleted){
                                    req.flash("success", "TEST INFORMATION DELETED SUCCESSFULLY");
                                    res.redirect("back");
                                }
                            })
                        }
                    });
                }else{
                    console.log(err);
                }
            });
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });

});

//END OF TEST CRUD FUNCTIONALITY

//==========================================================================================
//PRESCRIPTION CRUD FUNCTIONALITY
//Getting the form for input
router.get("/prescription/add", isLoggedIn, (req, res) => {
    res.render("addPrescription", {
        title : "Adding prescription information form",
        description : "Adding prescription info into the form"
    });
});

// Adding record in the prescription document
router.post("/prescription/add", (req, res) => {
    if(req.body.childID !== ""){
        Child.findOne({childID : req.body.childID})
        .then(child => {
            if(child){
                Prescription.create({
                    doneBy : req.body.doneBy,
                    prescription : req.body.prescription,
                    childID : req.body.childID,
                    sickness : req.body.sickness
                })
                .then(prescription => {
                    if(prescription){
                        req.flash("success", "PRESCRIPTION INFO SAVED SUCCESSFULLY");
                        res.redirect("back");
                    }
                })
                .catch(err => {
                    if(err){
                        console.log(err);
                        res.redirect("back");
                    }
                });
            }else{
                req.flash("error", "CHILD ID IS NOT IN THE SYSTEM");
                res.redirect("back");
            }
        })
    }else{
        req.flash("success", "CHILD ID MUST NOT BE BLANK");
        res.redirect("back");
    }

});

//Getting one prescription information
router.get("/prescription/:id", isLoggedIn, (req, res) => {
    Prescription.findOne({_id : req.params.id})
    .then(prescription => {
        if(prescription){
            res.render("viewPrescription", {
                title : "Prescription Information",
                description : "Showing prescription information",
                prescription : prescription
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
  
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
    
});

//Getting the information for edit
router.get("/prescription/:id/edit", isLoggedIn, (req, res) => {
    Prescription.findOne({_id : req.params.id})
    .then(prescription => {
        if(prescription){
            res.render("editPrescription", {
                title : "Prescription Information",
                description : "Showing prescription information",
                prescription : prescription
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
  
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

// Updating record in the prescription document
router.put("/prescription/:id/edit", (req, res) => {
    Prescription.findOneAndUpdate({_id : req.params.id}, {
        doneBy : req.body.doneBy,
        prescription : req.body.prescription,
        childID : req.body.childID,
        sickness : req.body.sickness
    })
    .then(prescription => {
        if(prescription){
            req.flash("success", "PRESCRIPTION INFO UPDATED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });

});

// Deleting prescription information
router.delete("/prescription/:id", (req, res) => {
    Prescription.findOneAndRemove({_id : req.params.id})
    .then(deleted => {
        if(deleted){
            req.flash("success", "PRESCRIPTION INFORMATION DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });

});

//END OF PRESCRIPTION CRUD FUNCTIONALITY

//==========================================================================================
//WARD CRUD FUNCTIONALITY
//Getting the form for input
router.get("/ward/add", isLoggedIn, (req, res) => {
    res.render("addWard", {
        title : "Adding ward information form",
        description : "Adding ward info into the form"
    });
});

// Adding record in the ward document
router.post("/ward/add", (req, res) => {
    Ward.create({
        name : req.body.name,
        description : req.body.description,
        hod : req.body.hod,
        noOfBeds : req.body.noOfBeds
    })
    .then(ward => {
        if(ward){
            req.flash("success", "WARD INFO SAVED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "CHILD ID IS NOT IN THE SYSTEM");
            res.redirect("back");
        }
    });
    
});

//Getting one ward information
router.get("/ward/:id", isLoggedIn, (req, res) => {
    Ward.findOne({_id : req.params.id})
    .then(ward => {
        if(ward){
            res.render("viewWard", {
                title : "Ward Information",
                description : "Showing ward information",
                ward : ward
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
  
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
    
});

//Getting the information for edit
router.get("/ward/:id/edit", isLoggedIn, (req, res) => {
    Ward.findOne({_id : req.params.id})
    .then(ward => {
        if(ward){
            res.render("editWard", {
                title : "Ward Information",
                description : "Showing ward information",
                ward : ward
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
  
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

// Updating record in the ward document
router.put("/ward/:id/edit", (req, res) => {
    Ward.findOneAndUpdate({_id : req.params.id}, {
        name : req.body.name,
        description : req.body.description,
        hod : req.body.hod,
        noOfBeds : req.body.noOfBeds
    })
    .then(ward => {
        if(ward){
            req.flash("success", "WARD INFO UPDATED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });

});

// Deleting ward information
router.delete("/ward/:id", (req, res) => {
    Ward.findOneAndRemove({_id : req.params.id})
    .then(deleted => {
        if(deleted){
            req.flash("success", "WARD INFORMATION DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });

});

//END OF WARD CRUD FUNCTIONALITY

//==========================================================================================
//DIAGNOSIS CRUD FUNCTIONALITY
//Getting the form for input
router.get("/diagnosis/add", isLoggedIn, (req, res) => {
    res.render("addDiagnosis", {
        title : "Adding diagnosis information form",
        description : "Adding diagnosis info into the form"
    });
});

// Adding record in the diagnosis document
router.post("/diagnosis/add", (req, res) => {
    Diagnosis.create({
        diagnosedBy : req.body.diagnosedBy,
        diagnosis : req.body.diagnosis,
        childID : req.body.childID
    })
    .then(diagnosis => {
        if(diagnosis){
            req.flash("success", "DIAGNOSIS INFO SAVED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "CHILD ID IS NOT IN THE SYSTEM");
            res.redirect("back");
        }
    });
    
});

//Getting one diagnosis information
router.get("/diagnosis/:id", isLoggedIn, (req, res) => {
    Diagnosis.findOne({_id : req.params.id})
    .then(diagnosis => {
        if(diagnosis){
            res.render("viewWard", {
                title : "Diagnosis Information",
                description : "Showing diagnosis information",
                diagnosis : diagnosis
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
  
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
    
});

//Getting the information for edit
router.get("/diagnosis/:id/edit", isLoggedIn, (req, res) => {
    Diagnosis.findOne({_id : req.params.id})
    .then(diagnosis => {
        if(diagnosis){
            res.render("editWard", {
                title : "Diagnosis Information",
                description : "Showing Diagnosis information",
                ward : ward
            });
        }else{
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");
        }
  
    })
    .catch(err => {
        if(err){
            req.flash("error", "NO RECORD FOUND");
            res.redirect("back");
        }
    });
});

// Updating record in the diagnosis document
router.put("/diagnosis/:id/edit", (req, res) => {
    Diagnosis.findOneAndUpdate({_id : req.params.id}, {
        name : req.body.name,
        description : req.body.description,
        hod : req.body.hod,
        noOfBeds : req.body.noOfBeds
    })
    .then(ward => {
        if(ward){
            req.flash("success", "DIAGNOSIS INFO UPDATED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });

});

// Deleting diagnosis information
router.delete("/diagnosis/:id", (req, res) => {
    Diagnosis.findOneAndRemove({_id : req.params.id})
    .then(deleted => {
        if(deleted){
            req.flash("success", "DIAGNOSIS INFORMATION DELETED SUCCESSFULLY");
            res.redirect("back");
        }
    })
    .catch(err => {
        if(err){
            console.log(err);
            res.redirect("back");
        }
    });

});

//END OF DIAGNOSIS CRUD FUNCTIONALITY

//==========================================================================================
//REPORTS SECTION
router.get("/reports", isLoggedIn, (req, res) => {
    res.render("reports", {
        title : "Reports Section",
        description : "Showing the different report sections"
    });
});
//==========================================================================================
//Birth Certificate
router.get("/birth_certificate", isLoggedIn, (req, res) => {
    res.render("birthCertificate", {
        title : "Child's Birth Certificate",
        description : "Showing child's birth certificate"
    });
});

//Birth Certificate Search Logic
router.post("/birth_certificate/:childID", (req, res) => {
    Child.findById({_id : req.params.childID})
    .then(child => {
        if(child){
            res.redirect(`/birth_certificate/${child._id}`);
            res.render("birthCertificate", {
                title : "Child's Birth Certificate",
                description : "Child's Birth Certificate Information"
            });
        }
    })
});

//Birth Certificate Search Info
router.get("/birth_certificate/:id", isLoggedIn, (req, res) => {
    Delivery.findById({_id : req.params.id})
    .then(delivery => {
    return  Child.findOne({childID : delivery.childID})
    .then(child => {
    return Father.findOne({_id : child.father})
    .then(father => {
    return Mother.findOne({_id : child.mother})
    .then(mother => {
        if(mother){
            res.render("birthCertificate", {
                title : "Child's Birth Certificate",
                description : "Showing child's birth certificate",
                child : child,
                mother : mother,
                father : father,
                delivery : delivery
            });
        }else{
            res.render("birthCertificate", {
                title : "Child's Birth Certificate",
                description : "Showing child's birth certificate",
                child : child,
                father : father,
                delivery : delivery
            });
        }
    })
    })
    })
    })
    .catch(err => {
        if(err){
            req.flash("error", "CHILD ID NOT IN SYSTEM");
            res.redirect("back");

        }
    });

});

//==========================================================================================
//Death Certificate
router.get("/death_certificate", isLoggedIn, (req, res) => {
    res.render("deathCertificate", {
        title : "Child's Death Certificate",
        description : "Child's Death Certificate Information"
    });
});

//Death Certificate Search Logic
router.get("/death_certificate/:childID", (req, res) => {
    Deceased.findOne({childId : req.params.childID})
    .then(deceased => {
        if(deceased){
            res.render("deathCertificate", {
                title : "Child's Death Certificate",
                description : "Child's Death Certificate Information",
                deceased : deceased
            });
        }
    })
    .catch(err => {
        if(err){
            req.flash("error", "CHILD ID NOT IN THE SYSTEM");
            res.redirect("back");
        }
    });

});

//Webcam picture taker
router.get("/snap", (req, res) => {
    res.render("snap", {
        title: "Taking Pictures of the person",
        description: "Taking pictures"
    })
})

// END OF REPORTS SECTION
//==========================================================================================

router.get("/form", isLoggedIn, (req, res) => {
    res.render("forms", {
        title : "Test form",
        description : "Test formdescription"
    });
});

//GETTING THE FILES
router.get("/files/:filename", (req, res) => {
    gfs.files.findOne({filename : req.params.filename}, (err, foundFile) => {
        if(foundFile){
            const readstream = gfs.createReadStream(foundFile.filename);
            readstream.pipe(res);
        }else{
            console.log(err);
        }
    });
});

//Error
router.get("/*", (req, res) => {
    res.send("<h2>ERROR 404 <br></h2></h3>PAGE NOT FOUND</h2>");
});
//==========================================================================================

module.exports = router;
