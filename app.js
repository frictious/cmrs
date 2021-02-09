const   express                 = require("express"),
        Index                   = require("./routes/index"),
        mongoose                = require("mongoose"),
        bodyParser              = require("body-parser"),
        session                 = require("express-session"),
        methodOverride          = require("method-override"),
        flash                   = require("connect-flash"),
        passport                = require("passport");

//==========================================================================================
//CONFIG
const app = express();
require("dotenv").config();
require("./config/login")(passport);

app.set("view engine", "ejs");//Setting the view engine to be ejs
app.use(express.static("public"));//Setting the static files to come from the public folder
app.use(flash());//Using connect flash for flash messages

global.Promise = mongoose.Promise //Creating a mongoose promise on the global promise object
mongoose.connect(process.env.MONGOOSE, {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useFindAndModify : false
});

app.use(session({
    secret : "GOD IS GOOD ALL THE TIME",
    resave : true,
    saveUninitialized : true
}));

app.use(bodyParser.urlencoded({extended : false}));
app.use(methodOverride("_method"));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next();
});
app.use("/", Index);

//==========================================================================================
app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});