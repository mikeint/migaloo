const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const validatePostingsInput = require('../validation/postings');  
const moment = require('moment');
const postingAssign = require('../utils/postingAssign')
const logger = require('../utils/logging'); 
const address = require('../utils/address'); 
const notifications = require('../utils/notifications');

const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const postingTagsInsertHelper = new pgp.helpers.ColumnSet(['post_id', 'tag_id'], {table: 'posting_tags'});
const camelColumnConfig = db.camelColumnConfig
const jobPostFields = ['company_id', 'title', 'requirements', 'experience',
    'salary', 'preliminary', 'is_visible', 'address_id', 'interview_count',
    'opening_reason_id', 'opening_reason_comment', 'open_positions', 'job_type_id'];
const jobPostInsert = new pgp.helpers.ColumnSet([...jobPostFields].map(camelColumnConfig), {table: 'job_posting_all'});
const jobPostUpdate = new pgp.helpers.ColumnSet(['?post_id', ...jobPostFields.map(camelColumnConfig)], {table: 'job_posting_all'});



/**
 * Create a new job posting for the employer
 * @route POST api/employerPostings/create
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/create', passport.authentication,  (req, res) => {

    /**
     * Inputs Body:
     * title
     * requirements
     * company
     * salary (Optional)
     * autoAddRecruiters (Optional)
     * experience
     * tagIds (Optional)
     */
    var body = req.body
    const { errors, isValid } = validatePostingsInput(body);
    //check Validation
    if(!isValid) {
        const errorMessage = "Invalid Parameters"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, errors:errors});
    }
    var jwtPayload = body.jwtPayload;
    const validUser = (jwtPayload.userType == 2) || // Account manager
                (jwtPayload.userType == 3) // Company
    if(!validUser){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.address == null) body.address = {}
    var preliminary = false
    if(jwtPayload.userType == 3)
        preliminary = true
    postgresdb.one('SELECT company_id \
            FROM company_contact ec \
            INNER JOIN login l ON l.user_id = ec.company_contact_id \
            WHERE ec.company_contact_id = ${userId} AND ec.company_id = ${companyId}', 
            {userId:jwtPayload.id, companyId:body.company}).then(()=>{
        return postgresdb.tx(t => {
            // creating a sequence of transaction queries:
            return address.addAddress(body.address, t).then((addr_ret)=>{
                return t.one(pgp.helpers.insert({companyId:body.company, title:body.title, requirements:body.requirements,
                        preliminary:preliminary, isVisible:!preliminary, experience:body.experience, salary:body.salary,
                        addressId:addr_ret.address_id, interviewCount:body.interviewCount, openingReasonId:body.openReason,
                        openingReasonComment:body.openReasonExplain, openPositions:body.numOpenings, jobTypeId:body.jobType}, jobPostInsert) + 'RETURNING post_id, address_id')
            })
            .then((post_ret)=>{
                logger.info('Add new job posting', {tags:['job', 'new'], url:req.originalUrl, email:jwtPayload.email, ...body, preliminary: preliminary});
                if(body.tagIds != null && body.tagIds.length > 0){
                    const query = pgp.helpers.insert(body.tagIds.map(d=>{return {post_id: post_ret.post_id, tag_id: d}}), postingTagsInsertHelper);
                    const q2 = t.none(query);
                    return q2
                        .then(() => {
                            return Promise.resolve(post_ret.post_id)
                        })
                        .catch(err => {
                            return Promise.reject(err)
                        });
                }else{
                    return Promise.resolve(post_ret.post_id)
                }
            })
            .then((post_id) => {
                res.status(200).json({success: true, postId: post_id})
                if(body.autoAddRecruiters !== false && preliminary !== true){
                    postingAssign.findRecruitersForPost(post_id).then((data)=>{
                        postingAssign.assignJobToRecruiter(data.map(d=> {return {post_id: post_id, recruiter_id: d.recruiter_id}}))
                    }) // Async call to add posts to the new recruiter
                }
            }).catch((err)=>{
                logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
                return res.status(500).json({success: false, error:err})
            });
        })
    }).catch((err)=>{
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});
/**
 * Edit a job posting for the employer
 * @route POST api/employerPostings/edit
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/edit', passport.authentication,  (req, res) => {

    /**
     * Inputs Body:
     * title
     * requirements
     * employer
     * salary (Optional)
     * autoAddRecruiters (Optional)
     * experienceTypeId (Optional)
     * tagIds (Optional)
     */
    var body = req.body
    const { errors, isValid } = validatePostingsInput(body);
    //check Validation
    if(!isValid) {
        const errorMessage = "Invalid Parameters"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, errors:errors});
    }
    var jwtPayload = body.jwtPayload;
    const validUser = (jwtPayload.userType == 2)
    if(!validUser){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.address == null) body.address = {}
    postgresdb.one('SELECT company_id \
            FROM company_contact ec \
            INNER JOIN login l ON l.user_id = ec.company_contact_id \
            WHERE ec.company_contact_id = ${userId} AND ec.company_id = ${companyId}', 
            {userId:jwtPayload.id, companyId:body.company}).then(()=>{
        return postgresdb.tx(t => {
            // creating a sequence of transaction queries:
            return address.addAddress(body.address, t)
            .then((addr_ret)=>{
                const q1 = t.none('DELETE FROM posting_tags WHERE post_id = $1', [body.postId])
                const q2 = t.none(pgp.helpers.update({companyId:body.company, title:body.title, requirements:body.requirements,
                    preliminary:false, experience:body.experience, salary:body.salary,
                    addressId:addr_ret.address_id, interviewCount:body.interviewCount, openingReasonId:body.openReason,
                    openingReasonComment:body.openReasonExplain, openPositions:body.numOpenings, jobTypeId:body.jobType}, jobPostUpdate, null, {emptyUpdate:true}) + ' WHERE post_id = ${postId}', {postId: body.postId})
                return t.batch([q1, q2])
            })
            .then(()=>{
                logger.info('Edit job posting', {tags:['job', 'edit'], url:req.originalUrl, email:jwtPayload.email, ...body});
                if(body.tagIds != null && body.tagIds.length > 0){
                    const query = pgp.helpers.insert(body.tagIds.map(d=>{return {post_id: body.postId, tag_id: d}}), postingTagsInsertHelper);
                    const q2 = t.none(query);
                    return q2
                        .then(() => {
                            return Promise.resolve()
                        })
                        .catch(err => {
                            return Promise.reject(err)
                        });
                }else{
                    return Promise.resolve()
                }
            })
            .then(() => {
                res.status(200).json({success: true})
                if(body.autoAddRecruiters !== false){
                    postingAssign.findRecruitersForPost(body.postId).then((data)=>{
                        postingAssign.assignJobToRecruiter(data.map(d=> {return {post_id: body.postId, recruiter_id: d.recruiter_id}}))
                    }) // Async call to add posts to the new recruiter
                }
            }).catch((err)=>{
                logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
                return res.status(500).json({success: false, error:err})
            });
        })
    }).catch((err)=>{
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * List all job postings from an employer
 * @route POST api/employerPostings/list
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/get/:postId', passport.authentication, postListing);
router.get('/list', passport.authentication, postListing);
router.get('/list/:page', passport.authentication, postListing);
function postListing(req, res){
    var page = req.params.page;
    var postId = req.params.postId;
    if(page == null || page < 1)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    // Define the filters
    const filters = {
        'employer':'AND j.company_id in (${employer:csv})',
        'contactType':'AND ec.is_primary in (${contactType:csv})'
    }
    const paramsToAdd = {};
    Object.keys(req.query).forEach(k=>{
        const v = JSON.parse(req.query[k])
        if(v == null) return
        if(v.length > 0)
            paramsToAdd[k] = v
        else if(!isNaN(v))
            paramsToAdd[k] = v
    })
    const filtersToAdd = Object.keys(paramsToAdd).map(k=>filters[k]).join(" ")

    postgresdb.any('\
        SELECT j.*, a.*, op.opening_reason_name, \
            tag_names, tag_ids, new_posts_cnt, c.company_name, \
            posts_cnt, recruiter_count, (count(1) OVER())/10+1 as "pageCount" \
        FROM job_posting_all j \
        INNER JOIN company_contact ec ON j.company_id = ec.company_id \
        INNER JOIN company c ON c.company_id = j.company_id \
        LEFT JOIN opening_reason op ON j.opening_reason_id = op.opening_reason_id \
        LEFT JOIN job_type jt ON j.job_type_id = jt.job_type_id \
        LEFT JOIN ( \
            SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
            FROM posting_tags pt \
            INNER JOIN tags t ON t.tag_id = pt.tag_id \
            GROUP BY post_id \
        ) tg ON tg.post_id = j.post_id \
        LEFT JOIN ( \
            SELECT post_id, count(1) as recruiter_count \
            FROM job_recruiter_posting \
            GROUP BY post_id \
        ) rc ON rc.post_id = j.post_id \
        LEFT JOIN ( \
            SELECT post_id, SUM(CASE has_seen_post WHEN false THEN 1 ELSE 0 END) as new_posts_cnt, count(1) as posts_cnt \
            FROM candidate_posting cp \
            GROUP BY post_id \
        ) cd ON cd.post_id = j.post_id \
        LEFT JOIN address a ON a.address_id = j.address_id \
        WHERE ec.company_contact_id = ${contactId} AND j.active '+filtersToAdd+(postId != null?' AND j.post_id = ${postId}':'')+'\
        ORDER BY j.created_on DESC \
        OFFSET ${page} \
        LIMIT 10', {contactId:jwtPayload.id, page:(page-1)*10, ...paramsToAdd, postId:postId})
    .then((data) => {
        // Marshal data
        data = data.map(db.camelizeFields).map(m=>{
            address.convertFieldsToMap(m)
            var timestamp = moment(m.createdOn)
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.createdOn = timestamp.format("x");
            return m
        })
        res.json({success:true, jobPosts:data})
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}
/**
 * List all recruiters assigned to job postings
 * @route POST api/employerPostings/listRecruiters
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listRecruiters/:postId', passport.authentication, listRecruiters);
function listRecruiters(req, res){
    var postId = req.params.postId;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(postId == null){
        const errorMessage = "Missing postId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.any('\
        SELECT j.post_id, r.first_name, r.last_name, coalesce(rc.candidate_count, 0) as candidate_count, \
            j.response, j.recruiter_created_on \
        FROM job_posting j \
        LEFT JOIN ( \
            SELECT cp.recruiter_id, count(1) as candidate_count \
            FROM candidate_posting cp \
            WHERE cp.post_id = ${postId} \
            GROUP BY cp.recruiter_id \
        ) rc ON rc.recruiter_id = j.recruiter_id \
        INNER JOIN recruiter r ON r.recruiter_id = j.recruiter_id \
        WHERE j.post_id = ${postId} AND j.active \
        ORDER BY j.created_on DESC', {postId:postId})
    .then((data) => {
        // Marshal data
        data = data.map(db.camelizeFields).map(m=>{
            var timestamp = moment(m.recruiterCreatedOn)
            var ms = timestamp.diff(moment());
            m.recruiterCreated = moment.duration(ms).humanize() + " ago";
            m.recruiterCreatedOn = timestamp.format("x");
            return m
        })
        res.json({success:true, recruiters:data})
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}
/**
 * List all recruiters assigned to job postings
 * @route POST api/employerPostings/listNewRecruiters
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listNewRecruiters/:postId', passport.authentication, listNewRecruiters);
function listNewRecruiters(req, res){
    var postId = req.params.postId;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(postId == null){
        const errorMessage = "Missing postId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postingAssign.findRecruitersForPost(postId)
    .then((data) => {
        res.json({success:true, recruiters:data.map(db.camelizeFields)})
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}

/**
 * Set posting to be considered read
 * @route POST api/employerPostings/setRead/:postId/:candidateId
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setRead/:postId/:candidateId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId
    var candidateId = req.params.candidateId
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(postId == null){
        const errorMessage = "Missing postId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(candidateId == null){
        const errorMessage = "Missing Candidate Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.any('\
        SELECT 1 \
        FROM job_posting jp \
        INNER JOIN company_contact ec ON jp.company_id = ec.company_id \
        WHERE ec.company_contact_id = ${userId} AND jp.active AND jp.post_id = ${postId} \
        LIMIT 1', {postId:postId, userId:jwtPayload.id})
    .then(()=>{
        return postgresdb.none('UPDATE candidate_posting SET has_seen_post=true  WHERE candidate_id = $1 AND post_id = $2', [candidateId, postId])
        .then((data) => {
            res.json({success:true})
        })
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
/**
 * Set posting to be considered accepted or not accepted
 * Type is either, migaloo/employer/job
 * @route POST api/employerPostings/setAcceptedState/:type/:postId/:candidateId/:recruiterId
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setAccepted/:type/:postId/:candidateId/:recruiterId', passport.authentication,  (req, res) => {
    const jwtPayload = req.body.jwtPayload;
    const type = req.params.type;
    const postId = req.params.postId;
    const candidateId = req.params.candidateId;
    var recruiterId = req.params.recruiterId;
    const accepted = req.body.accepted;
    var denialReasonId = req.body.denialReasonId;
    var denialComment = req.body.denialComment;
    
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    const types = ['job', 'employer', 'migaloo']
    if(!types.includes(type)){
        const errorMessage = "Invalid Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(postId == null){
        const errorMessage = "Missing postId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(candidateId == null){
        const errorMessage = "Missing Candidate Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(recruiterId == null){
        const errorMessage = "Missing Recruiter Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(denialReasonId == null)
        denialReasonId = null;
    if(denialComment == null)
        denialComment = null;
    recruiterId = parseInt(recruiterId, 10);
    var companyData
    postgresdb.one('\
        SELECT jp.company_id \
        FROM job_posting jp \
        INNER JOIN company_contact ec ON jp.company_id = ec.company_id \
        WHERE ec.company_contact_id = ${userId} AND jp.active AND jp.post_id = ${postId} \
        LIMIT 1', {postId:postId, userId:jwtPayload.id})
    .then((company)=>{
        companyData = company;
        if(type === 'migaloo')
            return postgresdb.none('\
                UPDATE candidate_posting SET migaloo_accepted=${accepted}, denial_reason_id=${denialReasonId}, \
                    denial_comment=${denialComment},\ has_seen_response=NULL, migaloo_responded_on=NOW() \
                WHERE candidate_id = ${candidateId} AND post_id = ${postId} AND recruiter_id = ${recruiterId}',
                {accepted:accepted, denialReasonId:denialReasonId, candidateId:candidateId, postId:postId, recruiterId:recruiterId, denialComment:denialComment})
        else if(type === 'employer')
            return postgresdb.none('\
                UPDATE candidate_posting SET employer_accepted=${accepted}, denial_reason_id=${denialReasonId}, \
                    denial_comment=${denialComment}, employer_responded_on=NOW() \
                WHERE candidate_id = ${candidateId} AND post_id = ${postId} AND recruiter_id = ${recruiterId}',
                {accepted:accepted, denialReasonId:denialReasonId, candidateId:candidateId, postId:postId, recruiterId:recruiterId, denialComment:denialComment})
        else if(type === 'job')
            return postgresdb.none('\
                UPDATE candidate_posting SET job_accepted=${accepted}, denial_reason_id=${denialReasonId}, \
                    denial_comment=${denialComment}, job_responded_on=NOW() \
                WHERE candidate_id = ${candidateId} AND post_id = ${postId} AND recruiter_id = ${recruiterId}',
                {accepted:accepted, denialReasonId:denialReasonId, candidateId:candidateId, postId:postId, recruiterId:recruiterId, denialComment:denialComment})
        else
            throw new Error("Type does not line up with validation")
        
    })
    .then((data) => {
        if(type === 'migaloo' && accepted){
            var userId1, userId2;
            if(recruiterId < companyData.company_id){
                userId1 = recruiterId;
                userId2 = companyData.company_id;
            }else{
                userId1 = companyData.company_id;
                userId2 = recruiterId;
            }
            postgresdb.none('INSERT INTO messages_subject(user_id_1, user_id_2, subject_user_id, post_id) VALUES \
                    ($1, $2, $3, $4)', [userId1, userId2, candidateId, postId])
            .then((data) => {
                res.json({success:true})
            })
            .catch(err => {
                res.json({success:true}) // If this subject was already created just skip the error
            });
        }else
            res.json({success:true})
        
        // Notifications
        return postgresdb.many('SELECT \
            rc.recruiter_id as "userId", \
            cp.company_name as "companyName", \
            jp.title as "postTitle", \
            jp.post_id as "postId", \
            concat(c.first_name, \' \', c.last_name) as "candidateName" \
        FROM recruiter_candidate rc \
        INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
        INNER JOIN job_posting jp ON rc.recruiter_id = jp.recruiter_id \
        INNER JOIN company cp ON jp.company_id = cp.company_id \
        WHERE rc.candidate_id = ${candidate_id} AND rc.recruiter_id = ${recruiter_id} AND jp.post_id = ${post_id}',
            {candidate_id:candidateId, recruiter_id:recruiterId, post_id: postId})
        .then((data) => {
            const userIds = data.map(d=>d.userId)
            const templateData = data[0]
            var templateName = ''
            if(type === 'migaloo'){
                if(accepted)
                    templateName = 'acceptedByMigaloo'
                else
                    templateName = 'deniedByMigaloo'
            }else{
                if(accepted)
                    templateName = 'acceptedByEmployer'
                else
                    templateName = 'deniedByEmployer'
            }
            notifications.addNotification(userIds, templateName, templateData)
        })
        .catch(err => {
            logger.error('Employer Posting Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:(err.message+"\n"+err) || err, body:req.body});
        });
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:(err.message+"\n"+err) || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
/**
 * Set posting to be hidden
 * @route POST api/employerPostings/hide
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/hide', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.body.postId
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(postId == null){
        const errorMessage = "Missing postId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one('\
        SELECT jp.company_id \
        FROM job_posting jp \
        INNER JOIN company_contact ec ON jp.company_id = ec.company_id \
        WHERE ec.company_contact_id = ${userId} AND jp.active AND jp.post_id = ${postId} \
        LIMIT 1', {postId:postId, userId:jwtPayload.id})
    .then(()=>{
        // TODO: Return all coins that have not been accepted or rejected
        return postgresdb.none('UPDATE job_posting SET is_valid=false WHERE post_id = $1', [postId])
        .then((data) => {
            res.json({success:true})
        })
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
/**
 * Set posting to be removed
 * @route POST api/employerPostings/remove
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/remove', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.body.postId
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(postId == null){
        const errorMessage = "Missing postId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one('\
        SELECT jp.company_id \
        FROM job_posting jp \
        INNER JOIN company_contact ec ON jp.company_id = ec.company_id \
        WHERE ec.company_contact_id = ${userId} AND jp.active AND jp.post_id = ${postId} \
        LIMIT 1', {postId:postId, userId:jwtPayload.id})
    .then(()=>{
        // TODO: Return all coins that have not been accepted or rejected
        return postgresdb.none('UPDATE job_posting SET active=false WHERE post_id = $1', [postId])
        .then((data) => {
            res.json({success:true})
        })
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});

/**
 * List candidates for a job posting
 * @route POST api/employerPostings/listCandidates/:postId
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listCandidates/:postId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(postId == null){
        const errorMessage = "Missing postId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }

    postgresdb.any(' \
        SELECT c.candidate_id, r.first_name, r.last_name, r.phone_number, r.recruiter_id, rl.email, cp.migaloo_accepted, cp.employer_accepted,\
            cp.job_accepted, cp.has_seen_post, c.first_name as candidate_first_name, j.created_on as posted_on, c.resume_id, ms.message_subject_id, a.* \
        FROM job_posting_all j \
        INNER JOIN company_contact ec ON j.company_id = ec.company_id \
        INNER JOIN candidate_posting cp ON cp.post_id = j.post_id \
        INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
        LEFT JOIN address a ON a.address_id = c.address_id \
        INNER JOIN recruiter r ON r.recruiter_id = cp.recruiter_id \
        INNER JOIN messages_subject ms ON ms.subject_user_id = cp.candidate_id AND ms.post_id = j.post_id AND (ms.user_id_1 = cp.recruiter_id OR ms.user_id_2 = cp.recruiter_id)  \
        INNER JOIN login rl ON r.recruiter_id = rl.user_id \
        WHERE j.post_id = ${postId} AND ec.company_contact_id = ${userId} AND j.active \
        ORDER BY cp.created_on DESC', {postId:postId, userId:jwtPayload.id})
    .then((data) => {
        // Marshal data
        data = data.map(db.camelizeFields).map(m=>{
            address.convertFieldsToMap(m)
            var timestamp = moment(m.postedOn);
            var ms = timestamp.diff(moment());
            m.posted = moment.duration(ms).humanize() + " ago";
            m.postedOn = timestamp.format("x");
            return m
        })
        res.json({success:true, candidateList:data})
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
/**
 * List recruiters assigned to a job posting
 * @route POST api/employerPostings/listRecruiters/:postId
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listRecruiters/:postId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(postId == null){
        const errorMessage = "Missing postId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }

    postgresdb.any(' \
        SELECT r.recruiter_id, r.first_name, r.last_name, r.phone_number, rl.email, j.recruiter_created_on \
        FROM job_posting j \
        INNER JOIN company_contact ec ON j.company_id = ec.company_id \
        INNER JOIN recruiter r ON r.recruiter_id = j.recruiter_id \
        INNER JOIN login rl ON r.recruiter_id = rl.user_id \
        WHERE j.post_id = ${postId} AND ec.company_contact_id = ${userId} AND j.active \
        ORDER BY cp.created_on DESC', {postId:postId, userId:jwtPayload.id})
    .then((data) => {
        // Marshal data
        data = data.map(db.camelizeFields).map(m=>{
            var timestamp = moment(m.recruiterCreatedOn);
            var ms = timestamp.diff(moment());
            m.recruiterCreated = moment.duration(ms).humanize() + " ago";
            m.recruiterCreatedOn = timestamp.format("x");
            return m
        })
        res.json({success:true, recruiterList:data})
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
/**
 * Assign recruiter to a job posting
 * @route POST api/employerPostings/addRecruiter
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/addRecruiter', passport.authentication,  (req, res) => {
    const jwtPayload = req.body.jwtPayload;
    const postId = req.body.postId
    const recruiterId = req.body.recruiterId
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(postId == null){
        const errorMessage = "Missing postId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(recruiterId == null){
        const errorMessage = "Missing recruiterId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }

    postingAssign.assignJobToRecruiter([{
        recruiter_id:recruiterId,
        post_id:postId
    }])
    .then((data) => {
        res.json({success:true})
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});

module.exports = router;