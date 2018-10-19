var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: {type: String, required: true, index: {unique: true}, max: 20},
    password: {type: String, required: true, max: 20},
    email: String,
    mobile:{type: String, max: 10},
    birthday:{type: Date},
    country:String,
    city:String,
    bio:String,
    firstName:String,
    lastName:String,
    postCode:String,
    avatar: String,                     //The url for avatar
    // TODO history of last coderoom
    coderoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coderoom"
    },
    // TODO coderooms that I created
    myrooms: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Coderoom"
            }
    ],
    following:[
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String,
            avatar: String
        }
    ],
    follower:[
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String,
            avatar: String
        }
    ],
    isAdmin: {type: Boolean, default: false},
});
// Virtual for author's URL
UserSchema
    .virtual('url')
    .get(function () {
        return '/users/' + this._id;
    });
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);

