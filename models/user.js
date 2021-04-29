const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username required!!!']
    },
    password: {
        type: String,
        required: [true, 'Password required!!!']
    },
    isVoted: {
        type: Boolean,
        default: false
    }
})

userSchema.statics.findAndValidate = async function(username, password) {
    const foundUser = await this.findOne({username});
    if (foundUser) {
        const validPassword = await bcrypt.compare(password, foundUser.password);
        if (validPassword) {
            return foundUser;
        }
    }
    return false;
}

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = mongoose.model('User', userSchema);