var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    mobile:String,
    birthday:String,
    country:String,
    city:String,
    coderoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coderoom"
    },
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    follower:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    isAdmin: {type: Boolean, default: false},
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);