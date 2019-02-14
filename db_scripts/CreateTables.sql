DROP TABLE candidate_posting;
DROP TABLE job_posting;
DROP TABLE recruiter;
DROP TABLE candidate;
DROP TABLE employer;
DROP TABLE address;
DROP TABLE login;
DROP TABLE user_type;
DROP TABLE experience_type;
DROP TABLE posting_tags;

CREATE TABLE user_type (
    user_type_id int NOT NULL,
    user_type_name varchar(128) NOT NULL,
    PRIMARY KEY(user_type_id)
);
CREATE TABLE experience_type (
    experience_type_id int NOT NULL,
    experience_type_name varchar(128) NOT NULL,
    PRIMARY KEY(experience_type_id)
);
CREATE TABLE login (
    user_id bigserial,
    email varchar(128) UNIQUE NOT NULL,
    passwordhash varchar(128) NOT NULL,
    created_on timestamp NOT NULL,
    last_login timestamp,
    user_type_id int REFERENCES user_type(user_type_id),
    PRIMARY KEY(user_id)
);
CREATE TABLE address (
    address_id bigserial,
    street_address_1 varchar(128),
    street_address_2 varchar(128),
    city varchar(128),
    state varchar(128),
    country varchar(128),
    PRIMARY KEY(address_id)
);
CREATE TABLE employer (
    employer_id bigint REFERENCES login(user_id),
    contact_given_name varchar(128) NOT NULL,
    contact_family_name varchar(128) NOT NULL,
    contact_phone_number  varchar(32) NULL,
    contact_email  varchar(32) NULL,
    company_name  varchar(128) NULL,
    address_id bigint REFERENCES address(address_id),
    PRIMARY KEY(employer_id)
);
CREATE TABLE recruiter (
    recruiter_id bigint REFERENCES login(user_id),
    given_name varchar(128) NOT NULL,
    family_name varchar(128) NOT NULL,
    phone_number  varchar(32) NULL,
    address_id bigint REFERENCES address(address_id),
    PRIMARY KEY(recruiter_id)
);
CREATE TABLE job_posting (
    post_id bigserial,
    employer_id bigint REFERENCES employer(employer_id),
    title varchar(255) NOT NULL,
    caption varchar(1000) NOT NULL,
    experience_type_id int REFERENCES experience_type(experience_type_id),
    PRIMARY KEY(post_id)
);
CREATE TABLE candidate (
    candidate_id bigserial,
    given_name varchar(128) NOT NULL,
    family_name varchar(128) NOT NULL,
    email varchar(355) UNIQUE NOT NULL,
    created_on timestamp NOT NULL,
    PRIMARY KEY(candidate_id)
);
CREATE TABLE candidate_posting (
    candidate_id bigint REFERENCES candidate(candidate_id),
    post_id bigint REFERENCES job_posting(post_id),
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    coins int NOT NULL,
    PRIMARY KEY(candidate_id, post_id, recruiter_id)
);
CREATE TABLE posting_tags (
    tag_id bigserial,
    tag_name varchar(64) NOT NULL,
    PRIMARY KEY(tag_id)
);
INSERT INTO user_type (user_type_id, user_type_name) VALUES (1, 'Recruiter');
INSERT INTO user_type (user_type_id, user_type_name) VALUES (2, 'Employer');
INSERT INTO experience_type (experience_type_id, experience_type_name) VALUES (1, 'Entry Level');
INSERT INTO experience_type (experience_type_id, experience_type_name) VALUES (2, 'Mid Level');
INSERT INTO experience_type (experience_type_id, experience_type_name) VALUES (3, 'Senior Level');
-- FAKE DATA START
INSERT INTO posting_tags (tag_name) VALUES ('SQL'), ('C++'), ('C#'), ('Leadership'), ('Agile');
INSERT INTO login (email, passwordhash, created_on, user_type_id) VALUES ('r1@test.com', '9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08', TIMESTAMP '2015-04-28 10:23:54', 1); -- Add Recruiter, pass: test
INSERT INTO login (email, passwordhash, created_on, user_type_id) VALUES ('r2@test.com', '9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08', TIMESTAMP '2018-03-25 10:23:54', 1); -- Add Recruiter, pass: test
INSERT INTO login (email, passwordhash, created_on, user_type_id) VALUES ('e1@test.com', '9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08', TIMESTAMP '2006-07-21 10:23:54', 2); -- Add Employer, pass: test
INSERT INTO login (email, passwordhash, created_on, user_type_id) VALUES ('e2@test.com', '9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08', TIMESTAMP '2008-02-28 10:23:54', 2); -- Add Employer, pass: test
INSERT INTO address (street_address_1, city, state, country) VALUES ('123 Main St.', 'Toronto', 'ON', 'CA');
INSERT INTO address (street_address_1, city, state, country) VALUES ('4312 Dundas Rd.', 'Toronto', 'ON', 'CA');
INSERT INTO address (street_address_1, street_address_2, city, state, country) VALUES ('654 York Rd.', 'Suite 203', 'Toronto', 'ON', 'CA');
INSERT INTO employer (employer_id, contact_given_name, contact_family_name, contact_phone_number, company_name, address_id) VALUES (1, 'Steve', 'Smith', '905-555-5555', 'Google Inc.', 1);
INSERT INTO employer (employer_id, contact_given_name, contact_family_name, contact_phone_number, company_name, address_id) VALUES (2, 'Jerry', 'McGuire', '905-555-6666', 'Microsoft Inc.', 2);
INSERT INTO recruiter (recruiter_id, given_name, family_name, phone_number, address_id) VALUES (1, 'John', 'Macabee', '443-555-7777', 3);
INSERT INTO recruiter (recruiter_id, given_name, family_name, phone_number, address_id) VALUES (2, 'Jonny', 'Walker', '443-555-8888', 3);
INSERT INTO candidate (given_name, family_name, email, created_on) VALUES
    ('Sarah', 'Williams', 'sarah.w@gmail.com', TIMESTAMP '2009-10-06 10:23:54'),
    ('Amanda', 'Taylor', 'amanda34@gmail.com', TIMESTAMP '2006-10-21 10:23:54'),
    ('Elizabeth ', 'Blaese ', 'beth.blaese@hotmail.com', TIMESTAMP '2005-04-21 10:23:54'),
    ('Stephanie', 'Kim', 'stephanie.kim@gmail.com', TIMESTAMP '2003-10-04 10:23:54'),
    ('Nicholas ', 'Diaz', 'nick.diaz@gmail.com', TIMESTAMP '2002-01-30 10:23:54'),
    ('Anton', 'Moore', 'anton.morre@hotmail.com', TIMESTAMP '2001-10-01 10:23:54'),
    ('Chris', 'Roth', 'chrisroth@gmail.com', TIMESTAMP '2012-10-19 10:23:54'),
    ('Lukas', 'Page', 'lukaspage@gmail.com', TIMESTAMP '2007-06-22 10:23:54');

COMMIT;