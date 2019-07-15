const express = require('express');

const db = require('../utils/db');
const ses = require('./ses');

const postgresdb = db.postgresdb
const pgp = db.pgp

const addUser = new pgp.helpers.ColumnSet(['email', 'user_type_id'], {table: 'company_contact'});

function inviteByEmails(emails, type, company){
    return new Promise((resolve, reject)=>{
        const data = emails.map(email=>{return {email:email, user_type_id:type}})
        const query = pgp.helpers.insert(data, addUser) + 'RETURNING user_id, email';
        return t.any(query)
        .then((data)=>{
            data.forEach(d=>ses.sendUserInvite(d.user_id, d.email, company))
            return resolve(data.map(d=>d.user_id))
        }).catch(reject)
    })
}

module.exports = {
    inviteByEmails:inviteByEmails
};