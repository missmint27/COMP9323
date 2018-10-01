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

    //Database models
    Coderoom  = require("./models/coderoom"),
    // Comment     = require("./models/comment"),
    User        = require("./models/user"),

    
//requiring routes
//     commentRoutes    = require("./routes/comments"),
    indexRoutes      = require("./routes/index"),
    coderoomRoutes = require("./routes/coderooms"),
    userRoutes = require("./routes/users"),
    // fileRouters = require("./routes/pythonFiles"),
    userRouter = require('./routes/users');


//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = 'mongodb://zen:a123321@ds139072.mlab.com:39072/ggwp';
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.urlencoded({extended: true}));

//currently working on pug for simplyfication, will change to ejs later.
app.set("view engine", "pug");


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

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (user.password != password) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, {username: user.username, id: user._id});
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

//Routers configration
userRouter(app, passport);
app.use("/", indexRoutes);
app.use("/api/coderooms", coderoomRoutes);
// app.use("/api/comments", commentRoutes);
// app.use("/api/files", fileRouters);


//server configration
port = process.env.PORT || 3000;
ip = process.env.IP || '127.0.0.1';
app.listen(port, ip, function(){
   console.log(`The server has been started. Visiting address: http://${ip}:${port}.`);
});