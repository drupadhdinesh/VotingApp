const mongoose = require('mongoose');
const Poll = require('./models/poll')

mongoose.connect('mongodb://localhost:27017/votingAppDb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("DB CONNECTED SUCCESSFULLY")
    })
    .catch(err => {
        console.log("DB CONNECTED FAILED!!!")
        console.log(err)
    })




const makePoll = async () => {
    const poll = new Poll({ header: 'Who will u vote for???' })
    poll.candidates.push(
        {name: 'Candidate1'},
        {name: 'Candidate2'},
        {name: 'Candidate3'},
        {name: 'Candidate4'},    
        )
    const res = await poll.save();
    console.log(res)
}
