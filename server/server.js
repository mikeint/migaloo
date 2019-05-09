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
const autocomplete = require('./routes/autocomplete');  
//const testAPI = require('./routes/testAPI'); 
const passport = require('./config/passport'); 
const cors = require('cors');
const methodOverride = require('method-override');

const app = express();

var logger = require('morgan');
app.use(logger('dev'));
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(methodOverride('_method')); 

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
app.use('/api/message', message);
//app.use('/testAPI', testAPI);


 

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
