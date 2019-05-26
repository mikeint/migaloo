const db = require('../config/db');

const postgresdb = db.postgresdb
const pgp = db.pgp

const topicData = {
    'acceptedByMigaloo': {
        topic_id: 1, // Recruiter, Candidate is Accepted
        url:'/recruiter/jobList/job/${postId}',
        title: 'Your candidate ${candidateName} has been accepted by Migaloo',
        message: '\
Migaloo has accepted ${candidateName} for the posting\r\n${postTitle} by ${companyName}.\r\n\
Migaloo will be passing along your clients information to ${companyName}.\r\n\
Someone will be in contact if there are any questions or additional steps needed.',
        params: ['companyName', 'postTitle', 'postId', 'candidateName']
    },
    'acceptedByEmployer': {
        topic_id: 1,  // Recruiter, Candidate is Accepted
        url:'/recruiter/jobList/job/${postId}',
        title: 'Your candidate ${candidateName} has been accepted by ${companyName}',
        message: '\
${companyName} has accepted ${candidateName} for the posting\r\n${postTitle}.\r\n\
Someone will be in contact for the steps to move forward.',
        params: ['companyName', 'postTitle', 'postId', 'candidateName']
    },
    'deniedByMigaloo': {
        topic_id: 2, // Recruiter, Candidate is Denied
        url:'/recruiter/jobList/job/${postId}',
        title: 'Your candidate ${candidateName} has been denied by Migaloo',
        message: '\
Migaloo has denied ${candidateName} for the posting\r\n${postTitle} by ${companyName}.\r\n\
Reason:\r\n${denialReason}\r\n\r\nComment:${denialComment}',
        params: ['companyName', 'postTitle', 'postId', 'candidateName', 'denialReason', 'denialComment']
    },
    'deniedByEmployer': {
        topic_id: 2,  // Recruiter, Candidate is Denied
        url:'/recruiter/jobList/job/${postId}',
        title: 'Your candidate ${candidateName} has been denied by ${companyName}',
        message: '\
${companyName} has denied ${candidateName} for the posting\r\n${postTitle}.\r\n\
Reason:\r\n${denialReason}\r\n\r\nComment:${denialComment}',
        params: ['companyName', 'postTitle', 'postId', 'candidateName', 'denialReason', 'denialComment']
    },
    'newJobPosting': {
        topic_id: 3,  // Recruiter, New Job Posting
        url:'/recruiter/jobList/job/${postId}',
        title: 'Assigned a new posting for ${companyName}',
        message: '\
A new job posting, ${postTitle}, is available.\r\n\
The requesting company is ${companyName}.',
        params: ['companyName', 'postId', 'postTitle']
    },
    'multipleNewJobPosting': {
        topic_id: 3,  // Recruiter, New Job Posting
        url:'/recruiter/jobList/job/',
        title: 'You have been assigned ${count} new job postings',
        message: '\
${count} new job postings, are available.',
        params: ['count']
    },
    'recruiterNewChat': {
        topic_id: 4,  // Recruiter, New Chat Message
        url:'/recruiter/chat/${postId}/${candidateId}',
        title: 'You have received a message from ${fromName}',
        message: '\
Regarding ${companyName}\'s job posting: ${postTitle}\r\n\r\n\
And the candidate ${candidateName} \
Message:\r\n\
${message}',
        params: ['fromName', 'postTitle', 'postId', 'candidateId', 'companyName', 'candidateName', 'message']
    },
    'recruiterNewMeeting': {
        topic_id: 4,  // Recruiter, New Chat Message
        url:'/recruiter/chat/${postId}/${candidateId}',
        title: 'You have received a meeting request from ${fromName}',
        message: '\
Regarding ${companyName}\'s job posting: ${postTitle}\r\n\r\n\
And the candidate ${candidateName} \
Meeting Request (${locationType}):\r\n\
${meetingSubject}\r\n\
${dateOffer} for ${minuteLength}',
        params: ['fromName', 'postTitle', 'postId', 'candidateId', 'companyName', 'candidateName', 'meetingSubject', 'locationType', 'dateOffer', 'minuteLength']
    },
    'employerNewCandidate': {
        topic_id: 5,  // Employer, Candidate Posted To Job
        url:'/employer/activeJobs',
        title: '${companyName} has recieved a new candidate',
        message: '\
${companyName}\' posting, ${postTitle}, recieved a new candidate.\r\n\
${name}',
        params: ['companyName', 'postTitle', 'name']
    },
    'employerNewJob': {
        topic_id: 6,  // Employer, New Job Posting
        url:'/employer/activeJobs',
        title: 'Recieved assigned a new posting for the company, ${companyName}',
        message: '\
A new job posting, ${postTitle}, is available.\r\n\
The requesting company is ${companyName}.',
        params: ['companyName', 'postTitle']
    },
    'employerNewChat': {
        topic_id: 7,  // Employer, New Chat Message
        url:'/employer/chat/${postId}/${candidateId}',
        title: 'You have received a message from ${fromName}',
        message: '\
Regarding ${companyName}\'s job posting: ${postTitle}\r\n\r\n\
And the candidate ${candidateName} \
Message:\r\n\
${message}',
        params: ['fromName', 'postTitle', 'postId', 'candidateId', 'companyName', 'candidateName', 'message']
    },
    'employerNewMeeting': {
        topic_id: 7,  // Employer, New Chat Message
        url:'/employer/chat/${postId}/${candidateId}',
        title: 'You have received a meeting request from ${fromName}',
        message: '\
Regarding ${companyName}\'s job posting: ${postTitle}\r\n\r\n\
And the candidate ${candidateName} \
Meeting Request:\r\n\
${meetingSubject}\r\n\
${dateOffer} for ${minuteLength}',
        params: ['fromName', 'postTitle', 'postId', 'candidateId', 'companyName', 'candidateName', 'meetingSubject', 'locationType', 'dateOffer', 'minuteLength']
    }
}
function applyTemplate(templateName, params){
    if(topicData[templateName] == null)
        throw new Error("Template does not exist")
    const template = {...topicData[templateName]}
    template.params.forEach(param=>{
        if(params[param] == null)
            throw new Error(`Missing parameter, ${param}, for template ${templateName}`)
        const regex = new RegExp("\\${"+param+"}", 'g')
        if(template.title != null)
            template.title = template.title.replace(regex, params[param])
        if(template.url != null)
            template.url = template.url.replace(regex, params[param])
        if(template.message != null)
            template.message = template.message.replace(regex, params[param])
    })
    return template
}
const addNotificationHelper = new pgp.helpers.ColumnSet(['user_id', 'title', 'message', 'url', 'topic_id'], {table: 'notification'});
function addNotification(userId, templateName, params){
    if(!Array.isArray(userId))
        userId = [userId]
    const template = applyTemplate(templateName, params)
    // Add email logic, and check notification settings
    const data = userId.map(id=>{return {...template, user_id:id}})
    const query = pgp.helpers.insert(data, addNotificationHelper)
    return postgresdb.none(query)
}
function getNewNotifications(userId, lastId, page=1, limit=5){
    return postgresdb.any('SELECT notification_id, title, message, url, created_on, has_seen \
        FROM notification \
        WHERE user_id = ${userId} AND notification_id > ${lastId} AND has_seen = false \
        ORDER BY notification_id DESC', {userId:userId, limit:limit, page: (page-1)*limit, lastId:lastId})
}
function getAllNotificationsCounts(userId){
    return postgresdb.one('SELECT coalesce(sum(cast((NOT has_seen) as int)), 0) AS new_notification_count, count(1) AS notification_count \
        FROM notification \
        WHERE user_id = ${userId}', {userId:userId})
}
function getAllNotifications(userId, searchAfter=null, limit=5){
    return postgresdb.any('SELECT notification_id, title, message, url, created_on, has_seen, (sum(cast(NOT has_seen as int)) OVER()) AS new_notification_count, (count(1) OVER()) AS notification_count \
        FROM notification \
        WHERE user_id = ${userId} '+(searchAfter != null ? 'AND notification_id < ${searchAfter}': '')+'\
        ORDER BY created_on DESC \
        LIMIT ${limit}', {userId:userId, limit:limit, searchAfter: searchAfter})
}
function notificationsSetSeen(userId, ids){
    return postgresdb.none('UPDATE notification SET has_seen=true WHERE user_id = ${userId} AND notification_id in (${ids:csv})',
            {ids:ids, userId:userId})
}
module.exports = {
    addNotification: addNotification,
    getNewNotifications: getNewNotifications,
    getAllNotifications: getAllNotifications,
    getAllNotificationsCounts: getAllNotificationsCounts,
    notificationsSetSeen: notificationsSetSeen
};