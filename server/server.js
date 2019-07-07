const NODE_ENV = process.env.NODE_ENV || 'dev';
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const auth = require('./routes/auth');
const landing = require('./routes/landing');
const mailto = require('./utils/mailto');  
const recruiterJobs = require('./routes/recruiterJobs');  
const employerPostings = require('./routes/employerPostings');
const accountManager = require('./routes/accountManager');
const employer = require('./routes/employer'); 
const company = require('./routes/company'); 
const recruiter = require('./routes/recruiter');
const candidate = require('./routes/candidate');  
const notifications = require('./routes/notifications');  
const profileImage = require('./routes/profileImage');  
const message = require('./routes/message');  
const resume = require('./routes/resume');  
const plan = require('./routes/plan');  
const autocomplete = require('./routes/autocomplete');  
//const testAPI = require('./routes/testAPI'); 
const passport = require('./config/passport'); 

const app = express();
if (NODE_ENV == 'dev') {
    var logger = require('morgan');
    app.use(logger('dev'));
}
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

// Passport middleware
passport.init(app);
app.use('/api/public/', express.static(path.join(`${__dirname}/public/`)))

// USE routes
app.use('/api/auth', auth);
app.use('/api/landing', landing);
app.use('/api/mailto', mailto);
app.use('/api/notifications', notifications);
app.use('/api/recruiterJobs', recruiterJobs);
app.use('/api/accountManager', accountManager);
app.use('/api/employerPostings', employerPostings);
app.use('/api/employer', employer);
app.use('/api/company', company);
app.use('/api/recruiter', recruiter);
app.use('/api/candidate', candidate);
app.use('/api/profileImage', profileImage);
app.use('/api/autocomplete', autocomplete);
app.use('/api/resume', resume);
app.use('/api/plan', plan);
app.use('/api/message', message);

// Server the frontend from node
if (NODE_ENV == 'test' || NODE_ENV == 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req,res) =>{
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}else{
    // require('./tests/base');
}
//app.use('/testAPI', testAPI);


 

const port = process.env.PORT || 5000;
console.log("Run Server")
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    app.emit( "app_started" )
});
module.exports = app
module.exports.close = server.close.bind(server)
