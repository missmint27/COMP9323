var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    session = require("express-session"),
    // seedDB      = require("./seeds"),
    methodOverride = require("method-override"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    Coderoom  = require("./models/coderoom"),
    Comment     = require("./models/comment"),
    User        = require("./models/user");

    
//requiring routes
var commentRoutes    = require("./routes/comments"),
    coderoomRoutes = require("./routes/coderooms"),
    indexRoutes      = require("./routes/index")
    
mongoose.connect("mongodb://localhost/coderoom");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));

// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "test for express-session!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});


app.use("/", indexRoutes);
app.use("/coderoom", coderoomRoutes);
app.use("/coderooms/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The server has been started");
});