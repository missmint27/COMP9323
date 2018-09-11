var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    nickname: String,
    email: String,
    mobile:String,
    birthday:String,
    country:String,
    city:String,
    coderoom_id:[],
    isAdmin: {type: Boolean, default: false}
    
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);