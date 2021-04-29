const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    header: {
        type: String,
        required: [true, 'Username required!!!']
    },
    candidates: [
        {
            name: String,
            votes: {
                type: Number,
                default: 0
            }
        }
    ]
})

module.exports = mongoose.model('Poll', pollSchema);