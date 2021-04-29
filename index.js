const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const User = require('./models/user')
const Poll = require('./models/poll')
const session = require('express-session');
const flash = require('connect-flash');

mongoose.connect('mongodb://localhost:27017/votingAppDb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("DB CONNECTED SUCCESSFULLY")
    })
    .catch(err => {
        console.log("DB CONNECTED FAILED!!!")
        console.log(err)
    })


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.urlencoded({ extended: true }));
app.use(session({secret: 'secretkey', saveUninitialized: true, resave: true}));
app.use(flash())

app.use((req,res,next) => {
    res.locals.messages = req.flash('success');
    next();
})


const loginRequired = (req, res, next) => {
    if (!req.session.user_id) {
        req.flash('success', 'Need to Login')
        return res.redirect('/login')
    }
    next();
}

const adminAccessRequired = (req, res, next) => {
    if (!req.session.admin_id) {
        req.flash('success', 'Access Denied')
        return res.redirect('/login')
    }
    next();
}

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const {username, password} = req.body;

    const user = await User.findOne({username});
    if (user) {
        req.flash('success', 'Username taken!!!')
        res.redirect('/register')
    } else {
        const user = new User({username, password })
        await user.save();
        req.session.user_id = user._id;
        req.flash('success', 'Successfully registered')
        res.redirect('/')
    }
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser.username==='admin'){
        req.session.admin_id = foundUser._id
        req.flash('success', 'Welcome Admin')
        res.redirect('/admin')
    }
    else if (foundUser) {
        req.session.user_id = foundUser._id;
        if (foundUser.isVoted){
            req.flash('success', 'Already Voted!!!')
        }
        res.redirect('/')
    } else {
        req.flash('success', 'Invalid Credentials')
        res.redirect('/login')
    }
})

app.get('/', loginRequired, async (req, res) => {
    const user = await User.findById(req.session.user_id)
    const poll = await Poll.findOne();
    res.render('poll', {header: poll.header, candidates: poll.candidates, isVoted: user.isVoted})
})


app.post('/', loginRequired, async (req, res) => {
    const poll = await Poll.findOne();
    const user = await User.findById(req.session.user_id)
    const votedId = req.body['candidate'];
    for (let c of poll.candidates){
        if (c._id==votedId){
            c.votes+=1
        }
    }
    user.isVoted = true;
    await poll.save();
    await user.save();
    req.flash('success', 'Successfully Voted')
    res.redirect('/');
})

app.get('/admin', adminAccessRequired, async (req, res) => {
    const poll = await Poll.findOne();
    res.render('admin', {header: poll.header, candidates: poll.candidates})
})

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login')
})

app.get('*'), (req, res) => {
    res.send('404 Not Found')
}


app.listen(3000, () => {
    console.log("LISTENING ON PORT:3000!")
})