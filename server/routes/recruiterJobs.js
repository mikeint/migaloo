const express = require('express');
const router = express.Router();
const passport = require('../utils/passport');
const moment = require('moment');
const validateCandidatePosting = require('../validation/jobs');  
const notifications = require('../utils/notifications');
const logger = require('../utils/logging');
const address = require('../utils/address');

const db = require('../utils/db')
const postgresdb = db.postgresdb
const pgp = db.pgp


const listFilters = {
    'salary1':'AND j.salary >= ${salary1} AND j.salary <= ${salary2}',
    'experience1':'AND j.experience >= ${experience1} AND j.experience <= ${experience2}',
    'tags':'AND array_intersects(tg.tag_ids, ${tags:list}::bigint[])'
}
/**
 * List all available job postings
 * @route GET api/jobs/listJobs
 * @group jobs - Jobs for Recruiters
 * @returns {object} 200 - A list of maps containing jobs
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/list', passport.authentication, getJobs);
router.get('/list/:page', passport.authentication, getJobs);
router.get('/list/:page/:search', passport.authentication, getJobs);
router.get('/get/:jobId', passport.authentication, getJobs);
function getJobs(req, res){
    var search = req.params.search;
    var page = req.params.page;
    var jobId = req.params.jobId;
    if(page == null || page < 1)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var sqlArgs = {page:(page-1)*10, recruiterId: jwtPayload.id}
    if(search != null)
        sqlArgs['search'] = search.split(' ').map(d=>d+":*").join(" & ")
    if(jobId != null)
        sqlArgs['jobId'] = jobId
        
    // Define the filters
    const paramsToAdd = {};
    Object.keys(req.query).forEach(k=>{
        const v = JSON.parse(req.query[k])
        if(v == null) return
        if(v.length > 0)
            paramsToAdd[k] = v
        else if(!isNaN(v) && !Array.isArray(v))
            paramsToAdd[k] = v
    })
    const filtersToAdd = Object.keys(paramsToAdd).map(k=>listFilters[k]).join(" ")
    postgresdb.any('\
        SELECT j.company_id, j.post_id, title, requirements, experience, salary, company_name, image_id, \
            address_line_1, address_line_2, city, state_province, country, tag_ids, \
            tag_names, j.created_on as posted_on, (count(1) OVER())/10+1 as "pageCount" \
        FROM job_posting j \
        INNER JOIN company e ON j.company_id = e.company_id \
        LEFT JOIN address a ON a.address_id = e.address_id \
        LEFT JOIN ( \
            SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
            FROM posting_tags pt \
            INNER JOIN tags t ON t.tag_id = pt.tag_id \
            GROUP BY post_id \
        ) tg ON tg.post_id = j.post_id \
        '+
        (jobId != null ?
           'WHERE j.is_visible AND j.post_id = ${jobId} AND j.recruiter_id = ${recruiterId} '+filtersToAdd
        :
        (search ? 
            'WHERE j.is_visible AND ((company_name_search || posting_search) @@ to_tsquery(\'simple\', ${search})) AND j.recruiter_id = ${recruiterId} '+filtersToAdd+'\
            ORDER BY ts_rank_cd(company_name_search || posting_search, to_tsquery(\'simple\', ${search})) DESC'
        :
            'WHERE j.is_visible AND j.recruiter_id = ${recruiterId} '+filtersToAdd+' ORDER BY j.created_on DESC'
        ))+' \
        OFFSET ${page} \
        LIMIT 10', {...sqlArgs, ...paramsToAdd})
    .then((data) => {
        // Marshal data
        data = data.map(db.camelizeFields).map(m=>{
            var timestamp = moment(m.postedOn);
            var ms = timestamp.diff(moment());
            m.posted = moment.duration(ms).humanize() + " ago";
            m.postedOn = timestamp.format("x");
            return m
        })
        res.json({jobList:data, success:true})
    })
    .catch(err => {
        logger.error('Recruiter Jobs SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}

/**
 * List job postings that match candidates
 * @route GET api/jobs/listForCandidate/:candidateId
 * @group jobs - Jobs for Recruiters
 * @returns {object} 200 - A list of maps containing jobs
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listForCandidate/:candidateId', passport.authentication,  getJobsForCandidate);
router.get('/listForCandidate/:candidateId/:page', passport.authentication,  getJobsForCandidate);
router.get('/listForCandidate/:candidateId/:page/:search', passport.authentication,  getJobsForCandidate);
router.get('/getCandidateForJob/:candidateId/:jobId', passport.authentication,  getJobsForCandidate);
function getJobsForCandidate(req, res){
    var search = req.params.search;
    var page = req.params.page;
    var jobId = req.params.jobId;
    if(page == null || page < 1)
        page = 1;
    var candidateId = req.params.candidateId
    if(candidateId == null){
        const errorMessage = "Missing Candidate Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})

    }
    
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    // Define the filters
    const paramsToAdd = {};
    Object.keys(req.query).forEach(k=>{
        const v = JSON.parse(req.query[k])
        if(v == null) return
        if(v.length > 0)
            paramsToAdd[k] = v
        else if(!isNaN(v) && !Array.isArray(v))
            paramsToAdd[k] = v
    })
    const filtersToAdd = Object.keys(paramsToAdd).map(k=>listFilters[k]).join(" ")
    postgresdb.task(t => {
        return t.one('SELECT c.candidate_id, first_name, last_name, c.salary, c.experience, tg.tag_names, c.address_id \
            FROM recruiter_candidate rc \
            INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
            LEFT JOIN ( \
                SELECT pt.candidate_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
                FROM candidate_tags pt \
                INNER JOIN tags t ON t.tag_id = pt.tag_id \
                GROUP BY candidate_id \
            ) tg ON tg.candidate_id = rc.candidate_id \
            WHERE rc.recruiter_id = $1 AND c.candidate_id = $2', [jwtPayload.id, candidateId])
        .then(candidate_data=>{
            var sqlArgs = {candidateId:candidateId, page:(page-1)*10, recruiterId:jwtPayload.id}
            if(search != null)
                sqlArgs['search'] = search.split(' ').map(d=>d+":*").join(" & ")
            if(jobId != null)
                sqlArgs['jobId'] = jobId
            return t.any('\
                SELECT j.post_id, title, requirements, experience, salary, company_name, image_id, j.company_id, \
                    jc.distance, a.*, tag_ids, tag_names, \
                    ( \
                        coalesce(distance_score, 0.0)+ \
                        coalesce(salary_score, 0.0)+ \
                        coalesce(experience_score, 0.0) \
                    )/3*coalesce(tag_score, 0.0)*100.0 as score, \
                    j.created_on as posted_on, (count(1) OVER())/10+1 as "pageCount" \
                FROM job_posting j \
                INNER JOIN company e ON j.company_id = e.company_id \
                LEFT JOIN address a ON j.address_id = a.address_id \
                LEFT JOIN ( \
                    SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
                    FROM posting_tags pt \
                    INNER JOIN tags t ON t.tag_id = pt.tag_id \
                    GROUP BY post_id \
                ) tg ON tg.post_id = j.post_id \
                LEFT JOIN ( \
                    SELECT j.post_id, \
                        least(greatest((max(j.salary)-max(c.salary))/10.0, -1)+1, 1) \
                        -least(greatest((max(j.salary)-max(c.salary))/50.0, 0), 1) as salary_score, \
                        least(greatest((max(j.experience)-max(c.experience))/15.0, -1)+1, 1) \
                        -least(greatest((max(j.experience)-max(c.experience))/10.0, 0), 1) as experience_score, \
                        least(power(max(c.commute)/(greatest(max(ST_Distance(a.lat_lon, ac.lat_lon)), 0.1) / 1000.0)*0.9, 2.0), 1) as distance_score, \
                        SUM(similarity) / count(distinct tg.tag_id) as tag_score, \
                        max(ST_Distance(a.lat_lon, ac.lat_lon)) / 1000.0 as distance \
                    FROM ( \
                        SELECT ct.tag_id, pt.post_id, MAX(similarity) as similarity \
                        FROM candidate_tags ct \
                        INNER JOIN tags_equality te ON te.tag_id_1 = ct.tag_id \
                        INNER JOIN posting_tags pt ON te.tag_id_2 = pt.tag_id \
                        WHERE ct.candidate_id = ${candidateId} \
                        GROUP BY ct.tag_id, pt.post_id, ct.candidate_id \
                    ) tg \
                    INNER JOIN job_posting j ON j.post_id = tg.post_id \
                    INNER JOIN address a ON j.address_id = a.address_id \
                    CROSS JOIN (SELECT * FROM candidate WHERE candidate_id = ${candidateId}) c \
                    LEFT JOIN address ac ON c.address_id = ac.address_id \
                    WHERE j.is_visible AND j.recruiter_id = ${recruiterId} \
                    GROUP BY j.post_id \
                ) jc ON jc.post_id = j.post_id \
                '+
                (jobId?
                    'WHERE j.is_visible AND j.post_id = ${jobId} AND j.recruiter_id = ${recruiterId} '+filtersToAdd
                :
                (search ? 
                    'WHERE j.is_visible AND ((company_name_search || posting_search) @@ to_tsquery(\'simple\', ${search})) AND j.recruiter_id = ${recruiterId} '+filtersToAdd
                :'WHERE j.is_visible AND j.recruiter_id = ${recruiterId} '+filtersToAdd)
                )+' \
                ORDER BY coalesce(salary_score, 0.0)*coalesce(experience_score, 0.0)*coalesce(tag_score, 0.0) DESC NULLS LAST, j.created_on DESC \
                OFFSET ${page} \
                LIMIT 10', {...sqlArgs, ...paramsToAdd})
                
                // WHERE NOT EXISTS (SELECT 1 FROM candidate_posting cp WHERE cp.candidate_id = $1) \
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
                res.json({jobList:data, candidate:db.camelizeFields(candidate_data), success:true})
            })
        })
    })
    .catch(err => {
        logger.error('Recruiter Jobs SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}

/**
 * Post candidate to job
 * @route POST api/jobs/postCandidate
 * @group jobs - Jobs for Recruiters
 * @params {number} body.candidateId - Candidate Id
 * @params {number} body.postId - Id of the job post
 * @params {number} body.coins - Number of coins
 * @returns {object} 200 - A success message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/postCandidate', passport.authentication,  (req, res) => {
    var body = req.body
    const { errors, isValid } = validateCandidatePosting(body);
    //check Validation
    if(!isValid) {
        const errorMessage = "Invalid Parameters"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, errors:errors});
    }
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }

    postgresdb.tx(t => {
        // Will fail if not their candidate, also grab the company contacts to send notifications too
        const q1 = t.many('SELECT \
            cc.company_contact_id as "userId", \
            cp.company_name as "companyName", \
            jp.title as "postTitle", \
            concat(c.first_name, \' \', c.last_name) as "name", \
            cp.company_id \
        FROM recruiter_candidate rc \
        INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
        INNER JOIN job_posting jp ON rc.recruiter_id = jp.recruiter_id \
        INNER JOIN company_contact cc ON cc.company_id = jp.company_id \
        INNER JOIN account_manager ac ON cc.company_contact_id = ac.account_manager_id \
        INNER JOIN company cp ON cc.company_id = cp.company_id \
        WHERE jp.is_visible AND rc.candidate_id = ${candidate_id} AND rc.recruiter_id = ${recruiter_id} AND jp.post_id = ${post_id}',
            {candidate_id:body.candidateId, recruiter_id:jwtPayload.id, post_id: body.postId})

        const q2 = t.none('INSERT INTO candidate_posting (candidate_id, post_id, recruiter_id, comment) VALUES ($1, $2, $3, $4)',
                            [body.candidateId, body.postId, jwtPayload.id, body.comment])

        // const q3 = t.one('UPDATE recruiter SET coins = coins - $1 WHERE recruiter_id = $2 RETURNING coins',
        //                     [body.coins, jwtPayload.id])
        return t.batch([q1, q2])
        .then((data)=>{
            const toNotify = data[0]
            const toNotifyUsers = toNotify.map(d=>d.userId)
            const toNotifyTemplate = toNotify[0]

            var userId1, userId2;
            if(jwtPayload.id < toNotifyTemplate.company_id){
                userId1 = jwtPayload.id;
                userId2 = toNotifyTemplate.company_id;
            }else{
                userId1 = toNotifyTemplate.company_id;
                userId2 = jwtPayload.id;
            }
            postgresdb.none('INSERT INTO messages_subject(user_id_1, user_id_2, subject_user_id, post_id) VALUES \
                    ($1, $2, $3, $4)', [userId1, userId2, candidateId, postId])
            .then((data) => {
                res.json({success:true})
            })
            .catch(err => {
                res.json({success:true}) // If this subject was already created just skip the error
            });
            notifications.addNotification(toNotifyUsers, 'employerNewCandidate', toNotifyTemplate)
            logger.info('Recruiter posted candidate', {tags:['post', 'candidate'], url:req.originalUrl, userId:jwtPayload.id, body:req.body});
        })
    }).catch((err)=>{
        logger.error('Recruiter Jobs SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});
/**
 * List candidates that have been posted and their status
 * @route POST api/jobs/listPostedCandidates/:jobId
 * @group jobs - Jobs for Recruiters
 * @params {number} body.candidateId - Candidate Id
 * @params {number} body.postId - Id of the job post
 * @params {number} body.coins - Number of coins
 * @returns {object} 200 - A success message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listPostedCandidates/:jobId', passport.authentication,  (req, res) => {
    var jobId = req.params.jobId;
    if(jobId == null){
        const errorMessage = "Missing Job Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one('SELECT 1 \
            FROM job_posting jp \
            WHERE jp.post_id = ${jobId} AND jp.recruiter_id = ${recruiterId}', {recruiterId:jwtPayload.id, jobId:jobId})
    .then(()=>{
        return postgresdb.any('\
            SELECT c.first_name, c.last_name, cp.*, dr.denial_reason_text, ms.message_subject_id \
            FROM job_posting jp \
            INNER JOIN candidate_posting cp ON jp.post_id = cp.post_id AND jp.recruiter_id = cp.recruiter_id \
            INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
            INNER JOIN messages_subject ms ON ms.subject_user_id = cp.candidate_id AND ms.post_id = jp.post_id AND (ms.user_id_1 = cp.recruiter_id OR ms.user_id_2 = cp.recruiter_id) \
            LEFT JOIN denial_reason dr ON cp.denial_reason_id = dr.denial_reason_id \
            WHERE jp.post_id = ${jobId} AND jp.recruiter_id = ${recruiterId} \
            ORDER BY cp.created_on DESC \
            ', {recruiterId:jwtPayload.id, jobId:jobId})
            
            // WHERE NOT EXISTS (SELECT 1 FROM candidate_posting cp WHERE cp.candidate_id = $1) \
        .then((data) => {
            // Marshal data
            data = data.map(db.camelizeFields).map(m=>{
                var timestamp = moment(m.createdOn);
                var ms = timestamp.diff(moment());
                m.created = moment.duration(ms).humanize() + " ago";
                m.createdOn = timestamp.format("x");
                return m
            })
            res.json({candidates:data, success:true})
        })
    })
    .catch(err => {
        logger.error('Recruiter Jobs SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});

module.exports = router;