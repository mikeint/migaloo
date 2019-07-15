const express = require('express');
const router = express.Router();
const passport = require('../utils/passport');
const moment = require('moment');
const validateCandidateInput = require('../validation/candidate');  
const logger = require('../utils/logging');
const address = require('../utils/address');

const db = require('../utils/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const camelColumnConfig = db.camelColumnConfig
const candidateTagsInsertHelper = new pgp.helpers.ColumnSet(['candidate_id', 'tag_id'], {table: 'candidate_tags'});
const benefitsInsertHelper = new pgp.helpers.ColumnSet(['candidate_id', 'benefit_id'], {table: 'candidate_benefit'});

const candidateFields = ['first_name', 'last_name', 'experience', 'salary', 'relocatable', 'commute', 'url', 'email', 'address_id'];
const candidateInsert = new pgp.helpers.ColumnSet(candidateFields.map(camelColumnConfig), {table: 'candidate'});
const candidateUpdate = new pgp.helpers.ColumnSet(['?candidate_id', ...candidateFields.map(camelColumnConfig)], {table: 'candidate'});
const generateUploadMiddleware = require('../utils/upload').generateUploadMiddleware
const upload = generateUploadMiddleware('profile_image/')

const generateImageFileNameAndValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var now = Date.now()
    req.params.fileName = jwtPayload.id+"_image_"+now.toString()
    req.params.jwtPayload = jwtPayload
    next()
}

/**
 * Upload recruiter profile image
 * @route GET api/employer/uploadImage
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/uploadImage/:candidateId', passport.authentication, generateImageFileNameAndValidation, upload.any('filepond'), (req, res) => {
    var jwtPayload = req.params.jwtPayload;
    postgresdb.none('UPDATE candidate SET image_id=$1 WHERE candidate_id = $2', [req.params.finalFileName, req.params.candidateId])
    .then((data) => {
        res.json({success:true, imageId:req.params.finalFileName})
    })
    .catch(err => {
        logger.error('Employer SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
/**
 * Create a new candidate for the recruiter
 * @route POST api/candidate/create
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/create', passport.authentication,  (req, res) => {

    /**
     * Inputs Body:
     * firstName
     * lastName
     * address
     * url (Optional)
     * relocatable
     * salary (Thousands) (Optional)
     * experience
     * tagIds (Optional)
     */
    var body = req.body
    const { errors, isValid } = validateCandidateInput(body);
    //check Validation
    if(!isValid) {
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, errors:errors});
    }
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Must be an recruiter to add a candidate"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.address == null) body.address = {}
    if(body.salary != null)
        body.salary = body.salary * 1000
    var candidateId
    postgresdb.tx(t => {
        // creating a sequence of transaction queries:
        return address.addAddress(body.address, t)
        .then((address_ret)=>{
            return t.one(pgp.helpers.insert({...body, addressId:address_ret.address_id}, candidateInsert) + " RETURNING candidate_id")
            .then((candidate_ret)=>{
                candidateId = candidate_ret.candidate_id
                const q3 = t.none('INSERT INTO recruiter_candidate (candidate_id, recruiter_id) VALUES ($1, $2)',
                                    [candidateId, jwtPayload.id])
                var queries = [q3];
                if(body.benefitIds != null && body.benefitIds.length > 0){
                    queries.push(t.none(pgp.helpers.insert(body.benefitIds.map(d=>{return {candidateId: candidateId, benefit_id: d}}), benefitsInsertHelper)));
                }
                if(body.tagIds != null && body.tagIds.length > 0){
                    queries.push(t.none(pgp.helpers.insert(body.tagIds.map(d=>{return {candidate_id: candidateId, tag_id: d}}), candidateTagsInsertHelper)));
                }
                logger.info('Recruiter added candidate', {tags:['candidate', 'recruiter'], url:req.originalUrl, userId:jwtPayload.id, body: {...req.body, candidateId:candidateId}});
                return t.batch(queries)
            })
        })
    }).then(()=>{
        res.json({success: true, candidateId:candidateId})
    }).catch((err)=>{
        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * Edit a candidate for the recruiter
 * @route POST api/candidate/edit
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/edit', passport.authentication,  (req, res) => {

    /**
     * Inputs Body:
     * candidateId
     * firstName
     * lastName
     * address
     * url (Optional)
     * relocatable
     * salary (Thousands) (Optional)
     * experience
     * tagIds (Optional)
     */
    var body = req.body
    const { errors, isValid } = validateCandidateInput(body);
    //check Validation
    if(!isValid) {
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, errors:errors});
    }
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Must be an recruiter to add a candidate"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.candidateId == null){
        const errorMessage = "Missing candidateId field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.address == null) body.address = {}
    if(body.salary != null)
        body.salary = body.salary * 1000
    
    postgresdb.tx(t => {
        var q1
        if(body.address.addressId != null)
            q1 = Promise.resolve({address_id:null})
        else
            q1 = address.addAddress(body.address, t)
        return q1.then((address_ret)=>{
            const q2 = t.none('DELETE FROM candidate_tags WHERE candidate_id = $1', [body.candidateId])
            const q3 = t.none('DELETE FROM candidate_benefit WHERE candidate_id = $1', [body.candidateId])
            const q4 = t.none(pgp.helpers.update({...body, addressId:address_ret.address_id}, candidateUpdate, null, {emptyUpdate:true}) + ' WHERE candidate_id = ${candidateId}', {candidateId: body.candidateId})
            return t.batch([q2, q3, q4]).then(()=>{
                var queries = [];
                if(body.benefitIds != null && body.benefitIds.length > 0){
                    queries.push(t.none(pgp.helpers.insert(body.benefitIds.map(d=>{return {candidateId: candidateId, benefit_id: d}}), benefitsInsertHelper)));
                }
                if(body.tagIds != null && body.tagIds.length > 0){
                    queries.push(t.none(pgp.helpers.insert(body.tagIds.map(d=>{return {candidate_id: body.candidateId, tag_id: d}}), candidateTagsInsertHelper)));
                }
                if(queries.length > 0){
                    return t.batch(queries).then(()=>{
                        return res.json({success: true})
                    }).catch((err)=>{
                        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
                        return res.status(500).json({success: false, error:err})
                    });
                }
                else{
                    res.json({success: true})
                    return []
                }
            }).catch((err)=>{
                logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
                return res.status(500).json({success: false, error:err})
            });
        }).catch((err)=>{
            logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
            return res.status(500).json({success: false, error:err})
        });
    }).catch((err)=>{
        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * Delete a candidate for the recruiter
 * @route POST api/candidate/delete
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/delete', passport.authentication,  (req, res) => {

    /**
     * Inputs Body:
     * candidateId
     */
    var body = req.body

    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Must be an recruiter to add a candidate"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.candidateId == null){
        const errorMessage = "Missing candidateId field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    postgresdb.none('UPDATE candidate SET active=false WHERE candidate_id = $1', [body.candidateId])
    .then(()=>{
        return res.json({success: true})
    }).catch((err)=>{
        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * List the candidates for the recruiter
 * @route POST api/candidate/list
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/list', passport.authentication, listCandidates);
router.get('/list/:page', passport.authentication, listCandidates);
router.get('/list/:page/:search', passport.authentication, listCandidates);
router.get('/getCandidate/:candidateId', passport.authentication, listCandidates);
router.get('/getCandidate/:candidateId/:only', passport.authentication, listCandidates);
function listCandidates(req, res){
    var search = req.params.search;
    var candidateId = req.params.candidateId;
    var only = req.params.only;
    var page = req.params.page;
    if(page == null || page < 1)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var sqlArgs = {recruiterId:jwtPayload.id, page:(page-1)*10}
    if(search != null)
        sqlArgs['search'] = search.split(' ').map(d=>d+":*").join(" & ")
    if(candidateId != null)
        sqlArgs['candidateId'] = candidateId
    postgresdb.any(' \
        SELECT c.*, a.*, rc.created_on, \
            coalesce(cpd.posted_count, 0) as posted_count, coalesce(cpd.accepted_count, 0) as accepted_count, \
            coalesce(cpd.not_accepted_count, 0) as not_accepted_count, \
            coalesce(cpd.new_accepted_count, 0) as new_accepted_count, coalesce(cpd.new_not_accepted_count, 0) as new_not_accepted_count, \
            (count(1) OVER())/10+1 as "pageCount", tag_names, tag_ids, \
            cb.benefit_names as "benefitNames", cb.benefit_ids as "benefitIds" \
        FROM recruiter_candidate rc \
        INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
        LEFT JOIN address a ON a.address_id = c.address_id \
        LEFT JOIN ( \
            SELECT ct.candidate_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
            FROM candidate_tags ct \
            INNER JOIN tags t ON t.tag_id = ct.tag_id \
            GROUP BY candidate_id \
        ) tg ON tg.candidate_id = c.candidate_id \
        LEFT JOIN ( \
            SELECT cb.candidate_id, array_agg(t.benefit_name) as benefit_names, array_agg(t.benefit_id) as benefit_ids \
            FROM candidate_benefit cb \
            INNER JOIN benefits t ON t.benefit_id = cb.benefit_id \
            GROUP BY candidate_id \
        ) cb ON cb.candidate_id = c.candidate_id \
        LEFT JOIN ( \
            SELECT cp.candidate_id, \
                SUM(1) as posted_count, \
                SUM(cast(migaloo_accepted as int)) as accepted_count, \
                SUM(cast(migaloo_accepted as int)) as not_accepted_count, \
                SUM(CASE WHEN NOT has_seen_response AND migaloo_accepted THEN 1 ELSE 0 END) as new_accepted_count, \
                SUM(CASE WHEN NOT has_seen_response AND NOT migaloo_accepted THEN 1 ELSE 0 END) as new_not_accepted_count \
            FROM candidate_posting cp\
            WHERE cp.recruiter_id = ${recruiterId} \
            GROUP BY cp.candidate_id \
        ) cpd ON cpd.candidate_id = c.candidate_id\
        WHERE rc.recruiter_id = ${recruiterId} AND c.active \
        '+
        (candidateId ? ((only!=null?'AND c.candidate_id = ${candidateId} ':'')+'ORDER BY (CASE WHEN c.candidate_id = ${candidateId} THEN 1 ELSE 0 END) DESC, c.last_name ASC, c.first_name ASC') :
        (search ? 
            'AND (name_search @@ to_tsquery(\'simple\', ${search})) \
            ORDER BY ts_rank_cd(name_search, to_tsquery(\'simple\', ${search})) DESC'
        :
            'ORDER BY c.last_name ASC, c.first_name ASC'
        ))+' \
        OFFSET ${page} \
        LIMIT 10', sqlArgs)
    .then((data) => {
        // Marshal data
        data = data.map(db.camelizeFields).map(m=>{
            address.convertFieldsToMap(m)
            var timestamp = moment(m.createdOn);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.createdOn = timestamp.format("x");
            return m
        })
        res.json({candidateList:data, success:true})
    })
    .catch(err => {
        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}

/**
 * Add note for the candidate
 * @route POST api/candidate/addNote
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/addNote/:candidateId', passport.authentication, addNote);
function addNote(req, res){
    var candidateId = req.params.candidateId;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one(' \
        SELECT 1 \
        FROM candidate c \
        INNER JOIN recruiter_candidate rc ON rc.candidate_id = c.candidate_id \
        WHERE rc.recruiter_id = ${recruiterId} AND c.candidate_id = ${candidateId}',
        {recruiterId:jwtPayload.id, candidateId:candidateId})
    .then((data) => {
        postgresdb.any(' \
            INSERT INTO candidate_note (candidate_id, creator_id, note) VALUES (${candidateId}, ${creatorId}, ${note}) RETURNING note_id',
            {candidateId:candidateId, creatorId: jwtPayload.id, note:req.body.note})
        .then((noteData) => {
            res.json({success:true, noteIds:noteData.map(d=>d.note_id)})
        })
        .catch(err => {
            logger.error('Candidate Note Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
            res.status(500).json({success:false, error:err})
        });
    })
    .catch(err => {
        logger.error('Candidate Note Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}
/**
 * Delete note from the candidate
 * @route POST api/candidate/deleteNote
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/deleteNote/:candidateId', passport.authentication, deleteNote);
function deleteNote(req, res){
    var candidateId = req.params.candidateId;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one(' \
        SELECT 1 \
        FROM candidate c \
        INNER JOIN recruiter_candidate rc ON rc.candidate_id = c.candidate_id \
        WHERE rc.recruiter_id = ${recruiterId} AND c.candidate_id = ${candidateId}',
        {recruiterId:jwtPayload.id, candidateId:candidateId})
    .then((data) => {
        postgresdb.none(' \
            DELETE FROM candidate_note \
            WHERE note_id = ${noteId}',
            {noteId:req.body.noteId})
        .then((data) => {
            res.json({success:true})
        })
        .catch(err => {
            logger.error('Candidate Note Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
            res.status(500).json({success:false, error:err})
        });
    })
    .catch(err => {
        logger.error('Candidate Note Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}
/**
 * List the notes for the candidate
 * @route GET api/candidate/listNotes
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listNotes/:candidateId', passport.authentication, listNotes);
function listNotes(req, res){
    var candidateId = req.params.candidateId;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.any(' \
        SELECT cn.* \
        FROM candidate_note cn \
        INNER JOIN recruiter_candidate rc ON rc.candidate_id = cn.candidate_id \
        WHERE rc.recruiter_id = ${recruiterId} AND cn.candidate_id = ${candidateId}',
        {recruiterId:jwtPayload.id, candidateId:candidateId})
    .then((data) => {
        // Marshal data
        data = data.map(db.camelizeFields).map(m=>{
            var timestamp = moment(m.createdOn);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.createdOn = timestamp.format("x");
            return m
        })
        res.json({notes:data, success:true})
    })
    .catch(err => {
        logger.error('Candidate Note Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}

/**
 * List job postings for a candidate
 * @route GET api/candidate/listJobs/:candidateId
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listJobs/:candidateId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var candidateId = req.params.candidateId;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(candidateId == null){
        const errorMessage = "Missing candidateId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }

    postgresdb.any(' \
        SELECT j.post_id, j.title, j.created_on as posted_on, jt.job_type_name, cp.migaloo_accepted, cp.employer_accepted, \
            cp.job_accepted, cp.has_seen_post, ms.message_subject_id, a.* \
        FROM job_posting_all j \
        INNER JOIN company_contact ec ON j.company_id = ec.company_id \
        INNER JOIN candidate_posting cp ON cp.post_id = j.post_id \
        INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
        LEFT JOIN job_type jt ON j.job_type_id = jt.job_type_id \
        LEFT JOIN address a ON a.address_id = j.address_id \
        INNER JOIN messages_subject ms ON ms.subject_user_id = cp.candidate_id AND ms.post_id = j.post_id AND (ms.user_id_1 = cp.recruiter_id OR ms.user_id_2 = cp.recruiter_id)  \
        WHERE c.candidate_id = ${candidateId} AND cp.recruiter_id = ${userId} AND c.active \
        ORDER BY cp.created_on DESC', {candidateId:candidateId, userId:jwtPayload.id})
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
        res.json({success:true, jobList:data})
    })
    .catch(err => {
        logger.error('Employer Posting SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
/**
 * List the candidates for the recruiter
 * @route GET api/candidate/list
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listForJob/:postId', passport.authentication, listCandidatesForJob);
router.get('/listForJob/:postId/:page', passport.authentication, listCandidatesForJob);
router.get('/listForJob/:postId/:page/:search', passport.authentication, listCandidatesForJob);
function listCandidatesForJob(req, res){
    const search = req.params.search;
    var page = req.params.page;
    if(page == null || page < 1)
        page = 1;
    const jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    const postId = req.params.postId
    if(postId == null){
        const errorMessage = "Missing post Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    const recruiterId = jwtPayload.id;
    

    postgresdb.task(t => {
        return t.one('SELECT jp.post_id as "postId", jp.title, jp.salary, \
                jp.address_id as "addressId", jp.experience, tg.tag_names as "tagNames", jb.benefit_names as "benefitNames" \
            FROM job_posting jp \
            LEFT JOIN ( \
                SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
                FROM posting_tags pt \
                INNER JOIN tags t ON t.tag_id = pt.tag_id \
                GROUP BY post_id \
            ) tg ON tg.post_id = jp.post_id \
            LEFT JOIN ( \
                SELECT jb.post_id, array_agg(t.benefit_name) as benefit_names, array_agg(t.benefit_id) as benefit_ids \
                FROM job_benefit jb \
                INNER JOIN benefits t ON t.benefit_id = jb.benefit_id \
                GROUP BY post_id \
            ) jb ON jb.post_id = jp.post_id \
            WHERE jp.post_id = ${postId} AND jp.recruiter_id = ${recruiterId}', {postId:postId, recruiterId:recruiterId})
        .then(job_data=>{
            var sqlArgs = {recruiterId:jwtPayload.id, postId:postId, page:(page-1)*10}
            if(search != null)
                sqlArgs['search'] = search.split(' ').map(d=>d+":*").join(" & ")
            return t.any(' \
                SELECT c.*, a.*, rc.created_on as "createdOn", \
                    jc.distance, \
                    coalesce(cpd.posted_count, 0) as "posted_count", coalesce(cpd.accepted_count, 0) as "acceptedCount", \
                    coalesce(cpd.not_accepted_count, 0) as "notAcceptedCount", \
                    coalesce(cpd.new_accepted_count, 0) as "newAcceptedCount", coalesce(cpd.new_not_accepted_count, 0) as "newNotAcceptedCount", \
                    (count(1) OVER())/10+1 as "pageCount", tag_names as "tagNames", tag_ids as "tagIds", \
                    benefit_names as "benefitNames", benefit_ids as "benefitIds", \
                    ( \
                        coalesce(distance_score, 0.0)+ \
                        coalesce(salary_score, 0.0)+ \
                        coalesce(experience_score, 0.0) \
                    )/3*coalesce(tag_score, 0.0)*100.0 as score \
                FROM recruiter_candidate rc \
                INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
                LEFT JOIN address a ON a.address_id = c.address_id \
                LEFT JOIN ( \
                    SELECT ct.candidate_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
                    FROM candidate_tags ct \
                    INNER JOIN tags t ON t.tag_id = ct.tag_id \
                    GROUP BY candidate_id \
                ) tg ON tg.candidate_id = c.candidate_id \
                LEFT JOIN ( \
                    SELECT cb.candidate_id, array_agg(t.benefit_name) as benefit_names, array_agg(t.benefit_id) as benefit_ids \
                    FROM candidate_benefit cb \
                    INNER JOIN benefits t ON t.benefit_id = cb.benefit_id \
                    GROUP BY candidate_id \
                ) cb ON cb.candidate_id = c.candidate_id \
                LEFT JOIN ( \
                    SELECT cp.candidate_id, \
                        SUM(1) as posted_count, \
                        SUM(cast(migaloo_accepted as int)) as accepted_count, \
                        SUM(cast(migaloo_accepted as int)) as not_accepted_count, \
                        SUM(CASE WHEN NOT has_seen_response AND migaloo_accepted THEN 1 ELSE 0 END) as new_accepted_count, \
                        SUM(CASE WHEN NOT has_seen_response AND migaloo_accepted THEN 1 ELSE 0 END) as new_not_accepted_count \
                    FROM candidate_posting cp\
                    WHERE cp.recruiter_id = ${recruiterId} \
                    GROUP BY cp.candidate_id \
                ) cpd ON cpd.candidate_id = c.candidate_id \
                INNER JOIN ( \
                    SELECT c.candidate_id, \
                        least(greatest((max(j.salary)-max(c.salary))/10.0, -1)+1, 1) \
                        -least(greatest((max(j.salary)-max(c.salary))/50.0, 0), 1) as salary_score, \
                        least(greatest((max(j.experience)-max(c.experience))/15.0, -1)+1, 1) \
                        -least(greatest((max(j.experience)-max(c.experience))/10.0, 0), 1) as experience_score, \
                        least(power(max(c.commute)/(greatest(max(ST_Distance(a.lat_lon, ac.lat_lon)), 0.1) / 1000.0)*0.9, 2.0), 1) as distance_score, \
                        SUM(similarity) / count(distinct tg.tag_id) as tag_score, \
                        max(ST_Distance(a.lat_lon, ac.lat_lon)) / 1000.0 as distance \
                    FROM ( \
                        SELECT ct.tag_id, ct.candidate_id, pt.post_id, MAX(similarity) as similarity \
                        FROM candidate_tags ct \
                        INNER JOIN tags_equality te ON te.tag_id_1 = ct.tag_id \
                        INNER JOIN posting_tags pt ON te.tag_id_2 = pt.tag_id \
                        INNER JOIN recruiter_candidate rc ON rc.candidate_id = ct.candidate_id \
                        WHERE pt.post_id = ${postId} AND rc.recruiter_id = ${recruiterId} \
                        GROUP BY ct.tag_id, ct.candidate_id, pt.post_id \
                    ) tg \
                    INNER JOIN job_posting j ON j.post_id = tg.post_id \
                    INNER JOIN address a ON j.address_id = a.address_id \
                    FULL JOIN candidate c ON tg.candidate_id = c.candidate_id \
                    LEFT JOIN address ac ON c.address_id = ac.address_id \
                    WHERE j.is_visible AND j.recruiter_id = ${recruiterId} AND j.post_id = ${postId} \
                    GROUP BY c.candidate_id \
                ) jc ON jc.candidate_id = rc.candidate_id \
                WHERE rc.recruiter_id = ${recruiterId} AND c.active \
                '+
                (search ? 
                    'AND (name_search @@ to_tsquery(\'simple\', ${search}))'
                :'')+' \
                ORDER BY coalesce(salary_score, 0.0)*coalesce(experience_score, 0.0)*coalesce(tag_score, 0.0)*100.0 DESC, c.last_name ASC, c.first_name ASC \
                OFFSET ${page} \
                LIMIT 10', sqlArgs)
            .then((data) => {
                // Marshal data
                data = data.map(db.camelizeFields).map(m=>{
                    address.convertFieldsToMap(m)
                    var timestamp = moment(m.createdOn);
                    var ms = timestamp.diff(moment());
                    m.created = moment.duration(ms).humanize() + " ago";
                    m.createdOn = timestamp.format("x");
                    return m
                })
                res.json({candidateList:data, postData:job_data, success:true})
            })
        })
    })
    .catch(err => {
        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });;
}

module.exports = router;