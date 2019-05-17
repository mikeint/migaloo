const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const moment = require('moment');
const validateCandidatePosting = require('../validation/jobs');  
const notifications = require('../utils/notifications');
const logger = require('../utils/logging');

const postgresdb = require('../config/db').postgresdb


const listFilters = {
    'salary':'AND j.salary_type_id in (${salary:csv})',
    'experience':'AND j.experience_type_id in (${experience:csv})',
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
    if(page == null)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var sqlArgs = {page:(page-1)*10, recruiterId: jwtPayload.id}
    if(search != null)
        sqlArgs['search'] = search.split(' ').map(d=>d+":*").join(" & ")
    if(jobId != null)
        sqlArgs['jobId'] = jobId
        
    // Define the filters
    const validKeys = Object.keys(listFilters).filter(d=>Object.keys(req.query).includes(d))
    const paramsToAdd = {};
    validKeys.forEach(k=>{
        const v = JSON.parse(req.query[k])
        if(v.length > 0)
            paramsToAdd[k] = v
    })
    const filtersToAdd = Object.keys(paramsToAdd).map(k=>listFilters[k]).join(" ")
    postgresdb.any('\
        SELECT j.company_id, j.post_id, title, caption, experience_type_name, salary_type_name, company_name, image_id, \
            address_line_1, address_line_2, city, state, country, tag_ids, \
            tag_names, j.created_on as posted_on, (count(1) OVER())/10+1 AS page_count \
        FROM job_posting j \
        LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
        LEFT JOIN salary_type st ON j.salary_type_id = st.salary_type_id \
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
           'WHERE j.post_id = ${jobId} AND j.recruiter_id = ${recruiterId} '+filtersToAdd
        :
        (search ? 
            'WHERE ((company_name_search || posting_search) @@ to_tsquery(\'simple\', ${search})) AND j.recruiter_id = ${recruiterId} '+filtersToAdd+'\
            ORDER BY ts_rank_cd(company_name_search || posting_search, to_tsquery(\'simple\', ${search})) DESC'
        :
            'WHERE  j.recruiter_id = ${recruiterId} '+filtersToAdd+' ORDER BY j.created_on DESC'
        ))+' \
        OFFSET ${page} \
        LIMIT 10', {...sqlArgs, ...paramsToAdd})
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.posted_on);
            var ms = timestamp.diff(moment());
            m.posted = moment.duration(ms).humanize() + " ago";
            m.posted_on = timestamp.format("x");
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
    if(page == null)
        page = 1;
    var candidateId = req.params.candidateId
    if(candidateId == null){
        const errorMessage = "Missing Candidate Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})

    }
    
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    // Define the filters
    const validKeys = Object.keys(listFilters).filter(d=>Object.keys(req.query).includes(d))
    const paramsToAdd = {};
    validKeys.forEach(k=>{
        const v = JSON.parse(req.query[k])
        if(v.length > 0)
            paramsToAdd[k] = v
    })
    const filtersToAdd = Object.keys(paramsToAdd).map(k=>listFilters[k]).join(" ")
    postgresdb.task(t => {
        return t.one('SELECT c.candidate_id, first_name, last_name, st.salary_type_name, et.experience_type_name, tg.tag_names \
            FROM recruiter_candidate rc \
            INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
            LEFT JOIN experience_type et ON c.experience_type_id = et.experience_type_id \
            LEFT JOIN salary_type st ON c.salary_type_id = st.salary_type_id \
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
                SELECT j.post_id, title, caption, experience_type_name, salary_type_name, company_name, image_id, j.company_id, \
                    address_line_1, address_line_2, city, state, country, tag_ids, tag_names, \
                    coalesce(score, 0.0) as score, total_score, coalesce(score, 0.0)/total_score*100.0 as tag_score, j.created_on as posted_on, (count(1) OVER())/10+1 AS page_count \
                FROM job_posting j \
                LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
                LEFT JOIN salary_type st ON j.salary_type_id = st.salary_type_id \
                INNER JOIN company e ON j.company_id = e.company_id \
                LEFT JOIN address a ON a.address_id = e.address_id \
                LEFT JOIN ( \
                    SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
                    FROM posting_tags pt \
                    INNER JOIN tags t ON t.tag_id = pt.tag_id \
                    GROUP BY post_id \
                ) tg ON tg.post_id = j.post_id \
                \
                LEFT JOIN ( \
                    SELECT j.post_id, (COUNT(1) + \
                        (CASE WHEN count(j.experience_type_id) = 0 OR count(ci.experience_type_id) = 0 THEN 0 ELSE greatest(2-abs(least(max(j.experience_type_id - ci.experience_type_id), 0)), 0)/2.0 END) + \
                        (CASE WHEN count(j.salary_type_id) = 0 OR count(ci.salary_type_id) = 0 THEN 0 ELSE greatest(5-abs(least(max(j.salary_type_id - ci.salary_type_id), 0)), 0)/5.0 END)) as score, \
                        ( \
                            SELECT COUNT(1)+count(distinct ci.experience_type_id)+count(distinct ci.salary_type_id) \
                            FROM candidate_tags cti \
                            INNER JOIN candidate ci ON ci.candidate_id = cti.candidate_id \
                            WHERE cti.candidate_id = ${candidateId} \
                        ) as total_score \
                    FROM candidate_tags ct \
                    INNER JOIN posting_tags pt ON pt.tag_id = ct.tag_id \
                    INNER JOIN job_posting j ON j.post_id = pt.post_id \
                    INNER JOIN candidate ci ON ci.candidate_id = ct.candidate_id \
                    WHERE ci.candidate_id = ${candidateId} AND j.recruiter_id = ${recruiterId} \
                    GROUP BY j.post_id \
                ) jc ON jc.post_id = j.post_id \
                '+
                (jobId?
                    'WHERE j.post_id = ${jobId} AND j.recruiter_id = ${recruiterId} '+filtersToAdd
                :
                (search ? 
                    'WHERE ((company_name_search || posting_search) @@ to_tsquery(\'simple\', ${search})) AND j.recruiter_id = ${recruiterId} '+filtersToAdd
                :'WHERE j.recruiter_id = ${recruiterId} '+filtersToAdd)
                )+' \
                ORDER BY tag_score DESC NULLS LAST, j.created_on DESC \
                OFFSET ${page} \
                LIMIT 10', {...sqlArgs, ...paramsToAdd})
                
                // WHERE NOT EXISTS (SELECT 1 FROM candidate_posting cp WHERE cp.candidate_id = $1) \
            .then((data) => {
                // Marshal data
                data = data.map(m=>{
                    var timestamp = moment(m.posted_on);
                    var ms = timestamp.diff(moment());
                    m.posted = moment.duration(ms).humanize() + " ago";
                    m.posted_on = timestamp.format("x");
                    return m
                })
                res.json({jobList:data, candidate:candidate_data, success:true})
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
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json(errors);
    }
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
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
        WHERE rc.candidate_id = ${candidate_id} AND rc.recruiter_id = ${recruiter_id} AND jp.post_id = ${post_id}',
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
            notifications.addNotification(toNotifyUsers, 'employerNewCandidate', toNotifyTemplate)
            logger.info('Recruiter posted candidate', {tags:['post', 'candidate'], url:req.originalUrl, userId:jwtPayload.id, body:req.body});
            
            console.log("Posted candidate")
            res.json({success: true})
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
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one('SELECT 1 \
            FROM job_posting jp \
            WHERE jp.post_id = ${jobId} AND jp.recruiter_id = ${recruiterId}', {recruiterId:jwtPayload.id, jobId:jobId})
    .then(()=>{
        return postgresdb.any('\
            SELECT c.first_name, c.last_name, cp.*, dr.denial_reason_text \
            FROM job_posting jp \
            INNER JOIN candidate_posting cp ON jp.post_id = cp.post_id AND jp.recruiter_id = cp.recruiter_id \
            INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
            LEFT JOIN denial_reason dr ON cp.denial_reason_id = dr.denial_reason_id \
            WHERE jp.post_id = ${jobId} AND jp.recruiter_id = ${recruiterId} \
            ORDER BY cp.created_on DESC \
            ', {recruiterId:jwtPayload.id, jobId:jobId})
            
            // WHERE NOT EXISTS (SELECT 1 FROM candidate_posting cp WHERE cp.candidate_id = $1) \
        .then((data) => {
            // Marshal data
            data = data.map(m=>{
                var timestamp = moment(m.created_on);
                var ms = timestamp.diff(moment());
                m.created = moment.duration(ms).humanize() + " ago";
                m.created_on = timestamp.format("x");
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