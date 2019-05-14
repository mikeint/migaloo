const db = require('../config/db');
const notifications = require('./notifications');

const postgresdb = db.postgresdb
const pgp = db.pgp

const addRecruiter = new pgp.helpers.ColumnSet(['post_id', 'recruiter_id'], {table: 'job_recruiter_posting'});
function assignJobToRecruiter(data){
    /**
     * data = [
     *  {
     *    post_id: <postId>,
     *    recruiter_id: <recruiterId>
     *  },
     *  ...
     * ]
     * 
     */
    postgresdb.any('\
    SELECT jp.post_id as "postId", jp.title as "postTitle", c.company_name as "companyName" \
    FROM job_posting_all jp \
    INNER JOIN company c ON c.company_id = jp.company_id \
    WHERE jp.active AND jp.is_visible AND jp.post_id in (${postId:csv}) \
    ', {postId:data.map(d=>d.post_id)}).then(ret=>{
        data = data.map(d=>{ // Match up the data to the notification
            const found = ret.find(f=>f.postId == d.post_id)
            return {...d, ...found}
        })
        const search = {}
        data.forEach(d=>{ // Count how many new jobs for this recuriter
            if(search[d.recruiter_id] == null)
                search[d.recruiter_id] = 0
            search[d.recruiter_id]++
        })
        data.forEach(d=>{
            if(search[d.recruiter_id] != null){ // Check if we should send a message
                if(search[d.recruiter_id] <= 1)
                    notifications.addNotification(d.recruiter_id, 'newJobPosting', d)
                    .catch(err => {
                        console.error(err)
                        throw new Error(err)
                    });
                else if(search[d.recruiter_id] > 1){
                    notifications.addNotification(d.recruiter_id, 'multipleNewJobPosting', {count:search[d.recruiter_id]})
                    .catch(err => {
                        console.error(err)
                        throw new Error(err)
                    });
                    search[d.recruiter_id] = null; // Stop from sending another message
                }
            }
        })
    })
    .catch(err => {
        console.error(err)
        throw new Error(err)
    });
    const query = pgp.helpers.insert(data, addRecruiter);
    return postgresdb.none(query)
}
function findRecruitersForPost(postId, limit=5){
    /**
     * Find the best recruiters for a job posting
     * Look at the candidates they work with / have worked with
     * Last login date, login frequency
     * Field they work in / tags they work with
     * How many jobs they are currently working on
     */
    return postgresdb.any('\
        SELECT f.recruiter_id, f.first_name, f.last_name, f.job_count, f.logins_per_month, f.average_score_accetable_candidates, \
            ( \
                greatest(1 - (f.job_count / 5), 0.0) + \
                least(f.logins_per_month / 30, 1.0) + \
                f.average_score_accetable_candidates \
            ) / 3.0 as score \
        FROM ( \
            SELECT r.recruiter_id, r.first_name, r.last_name, \
                coalesce(jc.job_count, 0) as job_count, \
                coalesce(rh.logins_per_month, 0) as logins_per_month, \
                coalesce(rt.average_score_accetable_candidates, 0) as average_score_accetable_candidates \
            FROM recruiter r \
            LEFT JOIN ( \
                SELECT recruiter_id, count(1) as job_count \
                FROM job_recruiter_posting \
                GROUP BY recruiter_id \
            ) jc ON jc.recruiter_id = r.recruiter_id \
            LEFT JOIN ( \
                SELECT lh.user_id as recruiter_id, (sum(1) + date_part(\'day\', age(NOW(), l.created_on))) as logins_per_month  \
                FROM login_history lh \
                INNER JOIN login l ON l.user_id = lh.user_id \
                WHERE lh.login_date > NOW() - interval \'30\' day \
                GROUP BY lh.user_id, l.created_on \
            ) rh ON rh.recruiter_id = r.recruiter_id \
            LEFT JOIN ( \
                SELECT tp.recruiter_id, \
                    count(1) as total_accetable_candidates, \
                    avg(tp.score) as average_score_accetable_candidates, \
                    max(tp.score) as max_score_accetable_candidates \
                FROM ( \
                    SELECT rc.recruiter_id, ci.candidate_id, (COUNT(1) + \
                        (CASE WHEN count(j.experience_type_id) = 0 OR count(ci.experience_type_id) = 0 THEN 0 ELSE greatest(2-abs(least(max(j.experience_type_id - ci.experience_type_id), 0)), 0)/2.0 END) + \
                        (CASE WHEN count(j.salary_type_id) = 0 OR count(ci.salary_type_id) = 0 THEN 0 ELSE greatest(5-abs(least(max(j.salary_type_id - ci.salary_type_id), 0)), 0)/5.0 END)) / \
                        ( \
                            SELECT COUNT(1)+count(distinct ci.experience_type_id)+count(distinct ci.salary_type_id) \
                            FROM posting_tags cti \
                            WHERE cti.post_id = ${postId} \
                        ) as score \
                    FROM candidate_tags ct \
                    INNER JOIN posting_tags pt ON pt.tag_id = ct.tag_id \
                    INNER JOIN job_posting_all j ON j.post_id = pt.post_id \
                    INNER JOIN candidate ci ON ci.candidate_id = ct.candidate_id \
                    INNER JOIN recruiter_candidate rc ON rc.candidate_id = ct.candidate_id \
                    WHERE pt.post_id = ${postId} \
                    GROUP BY rc.recruiter_id, ci.candidate_id \
                ) tp \
                WHERE tp.score > 0.3 \
                GROUP BY tp.recruiter_id \
            ) rt ON rt.recruiter_id = r.recruiter_id \
            WHERE NOT EXISTS (SELECT 1 \
                FROM job_recruiter_posting jpi \
                WHERE r.recruiter_id = jpi.recruiter_id AND jpi.post_id = ${postId}) \
        ) f \
        ORDER BY ( \
            greatest(1 - (f.job_count / 5), 0.0) + \
            least(f.logins_per_month / 30, 1.0) + \
            f.average_score_accetable_candidates \
        ) DESC \
        LIMIT ${limit} \
    ', {postId:postId, limit:limit})
}
function findPostsForNewRecruiter(recruiterId, limit=5){
    /**
     * Find the best job posting for a new recruiter
     * Lets assume that they have not put in any information, or at least added candidates
     * And that we have not yet made the recruiters pick a domain
     */
    return postgresdb.any('\
        SELECT f.post_id, f.recruiter_count, f.candidate_count , f.age, \
            ( \
                greatest(1 - (f.recruiter_count / 5), 0.0) + \
                greatest(1 - (f.candidate_count / 7), 0.0) + \
                greatest(1 - (f.age / 14), 0.0) \
            ) as score \
        FROM ( \
            SELECT jp.post_id, \
                coalesce(rc.recruiter_count, 0) as recruiter_count, \
                coalesce(cc.candidate_count, 0) as candidate_count, \
                date_part(\'day\', age(NOW(), jp.created_on)) as age \
            FROM job_posting_all jp \
            LEFT JOIN ( \
                SELECT post_id, count(1) as recruiter_count \
                FROM job_recruiter_posting \
                GROUP BY post_id \
            ) rc ON rc.post_id = jp.post_id \
            LEFT JOIN ( \
                SELECT post_id, count(1) as candidate_count \
                FROM candidate_posting \
                GROUP BY post_id \
            ) cc ON cc.post_id = jp.post_id \
            WHERE NOT EXISTS (SELECT 1 \
                FROM job_recruiter_posting jpi \
                WHERE jpi.recruiter_id = ${recruiterId} AND jp.post_id = jpi.post_id) \
        ) f \
        ORDER BY ( \
            greatest(1 - (f.recruiter_count / 5), 0.0) + \
            greatest(1 - (f.candidate_count / 7), 0.0) + \
            greatest(1 - (f.age / 14), 0.0) \
        ) DESC \
        LIMIT ${limit} \
    ', {recruiterId:recruiterId, limit:limit})
}

module.exports = {
    assignJobToRecruiter:assignJobToRecruiter,
    findPostsForNewRecruiter:findPostsForNewRecruiter,
    findRecruitersForPost:findRecruitersForPost
};