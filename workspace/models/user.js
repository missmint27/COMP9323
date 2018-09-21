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
// Virtual for author's URL
UserSchema
    .virtual('url')
    .get(function () {
        return '/api/users/' + this._id;
    });
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);