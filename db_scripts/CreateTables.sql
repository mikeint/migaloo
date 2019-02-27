Drop VIEW user_master;
DROP TABLE rate_employer;
DROP TABLE rate_recruiter;
DROP TABLE rate_candidate;
DROP TABLE messages;
DROP TABLE transactions;
DROP TABLE posting_tags;
DROP TABLE candidate_tags;
DROP TABLE recruiter_candidate;
DROP TABLE candidate_posting;
DROP TABLE job_posting_contact;
DROP TABLE job_posting;
DROP TABLE recruiter;
DROP TABLE candidate;
DROP TABLE employer_contact;
DROP TABLE employer;
DROP TABLE address;
DROP TABLE login;
DROP TABLE user_type;
DROP TABLE salary_type;
DROP TABLE experience_type;
DROP TABLE tags;

CREATE TABLE user_type (
    user_type_id serial,
    user_type_name varchar(128) NOT NULL,
    PRIMARY KEY(user_type_id)
);
CREATE TABLE experience_type (
    experience_type_id serial,
    experience_type_name varchar(128) NOT NULL,
    PRIMARY KEY(experience_type_id)
);
CREATE TABLE salary_type (
    salary_type_id serial,
    salary_type_name varchar(128) NOT NULL,
    PRIMARY KEY(salary_type_id)
);
CREATE TABLE login (
    user_id bigserial,
    email varchar(128) UNIQUE,
    passwordhash varchar(128),
    created_on timestamp default NOW(),
    last_login timestamp,
    user_type_id int REFERENCES user_type(user_type_id),
    PRIMARY KEY(user_id)
);
CREATE UNIQUE INDEX login_lower_idx ON login ((lower(email)));
CREATE TABLE address (
    address_id bigserial,
    street_address_1 varchar(128),
    street_address_2 varchar(128),
    city varchar(128),
    state varchar(128),
    country varchar(128),
    lat_lon point,
    PRIMARY KEY(address_id)
);
CREATE TABLE employer (
    employer_id bigserial REFERENCES login(user_id),
    address_id bigint REFERENCES address(address_id),
    company_name  varchar(128) NULL,
    image_id varchar(128),
    active boolean default true,
    rating float default null,
    PRIMARY KEY(employer_id)
);
CREATE TABLE rate_employer (
    employer_id bigint REFERENCES employer(employer_id),
    user_id bigint REFERENCES login(user_id),
    rating int NOT NULL,
    PRIMARY KEY(employer_id, user_id)
);
CREATE TABLE employer_contact (
    employer_id bigint REFERENCES employer(employer_id),
    employer_contact_id bigint REFERENCES login(user_id),
    first_name varchar(128) NOT NULL,
    last_name varchar(128) NOT NULL,
    phone_number  varchar(32) NULL,
    image_id varchar(128),
    active boolean default true,
    isAdmin boolean default false,
    PRIMARY KEY(employer_contact_id)
);

CREATE TABLE recruiter (
    recruiter_id bigint REFERENCES login(user_id),
    address_id bigint REFERENCES address(address_id),
    first_name varchar(128) NOT NULL,
    last_name varchar(128) NOT NULL,
    phone_number  varchar(32) NULL,
    coins int DEFAULT 0 NOT NULL CHECK (coins >= 0),
    image_id varchar(128),
    active boolean default true,
    rating float default null,
    PRIMARY KEY(recruiter_id)
);
CREATE TABLE rate_recruiter (
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    user_id bigint REFERENCES login(user_id),
    rating int NOT NULL,
    PRIMARY KEY(recruiter_id, user_id)
);
CREATE TABLE job_posting (
    post_id bigserial,
    employer_id bigint REFERENCES employer(employer_id),
    salary_type_id int REFERENCES salary_type(salary_type_id),
    title varchar(255) NOT NULL,
    caption text NOT NULL,
	created_on timestamp default NOW(),
    experience_type_id int REFERENCES experience_type(experience_type_id),
    active boolean default true,
    PRIMARY KEY(post_id)
);
CREATE TABLE job_posting_contact (
    post_id bigint REFERENCES job_posting(post_id),
    employer_contact_id bigint REFERENCES employer_contact(employer_contact_id),
    PRIMARY KEY(post_id)
);
CREATE TABLE candidate (
    candidate_id bigint REFERENCES login(user_id),
    first_name varchar(128) NOT NULL,
    last_name varchar(128) NOT NULL,
    resume_id varchar(128),
    phone_number  varchar(32) NULL,
    salary_type_id int REFERENCES salary_type(salary_type_id),
    experience_type_id int REFERENCES experience_type(experience_type_id),
    active boolean default true,
    rating float default null,
    PRIMARY KEY(candidate_id)
);
CREATE TABLE rate_candidate (
    candidate_id bigint REFERENCES candidate(candidate_id),
    user_id bigint REFERENCES login(user_id),
    rating int NOT NULL,
    PRIMARY KEY(candidate_id, user_id)
);
CREATE TABLE recruiter_candidate (
    candidate_id bigint REFERENCES candidate(candidate_id),
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
	created_on timestamp default NOW(),
    PRIMARY KEY(candidate_id, recruiter_id)
);
CREATE TABLE candidate_posting (
    candidate_id bigint REFERENCES candidate(candidate_id),
    post_id bigint REFERENCES job_posting(post_id),
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    created_on timestamp default NOW(),
    responded_on timestamp,
    accepted boolean default false,
    not_accepted boolean default false,
    has_seen_post boolean default false,
    has_seen_response boolean default false,
    comment varchar(512),
    coins int NOT NULL CHECK (coins > 0),
    PRIMARY KEY(candidate_id, post_id, recruiter_id)
);
CREATE INDEX candidate_posting_idx ON candidate_posting(post_id, recruiter_id);
CREATE INDEX candidate_posting_cdt_idx ON candidate_posting(candidate_id);
CREATE TABLE messages (
    message_id bigserial,
    user_id_1 bigint REFERENCES login(user_id),
    user_id_2 bigint REFERENCES login(user_id),
    subject_user_id bigint REFERENCES login(user_id),
    to_id bigint REFERENCES login(user_id),
    post_id bigint REFERENCES job_posting(post_id),
    subject varchar(128) NOT NULL,
    message text NOT NULL,
    created_on timestamp default NOW(),
    has_seen boolean default false,
    PRIMARY KEY(message_id)
);
CREATE INDEX message_chain_idx ON messages(user_id_1, user_id_2);
CREATE INDEX message_chain_subject_idx ON messages(user_id_1, user_id_2, subject_user_id);
CREATE INDEX message_to_idx ON messages(to_id);
CREATE TABLE transactions (
    transaction_id bigserial,
    created_on timestamp default NOW(),
    coins int NOT NULL,
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    PRIMARY KEY(recruiter_id)
);
CREATE TABLE tags (
    tag_id bigserial,
    tag_name varchar(64) NOT NULL,
    PRIMARY KEY(tag_id)
);
CREATE UNIQUE INDEX tag_name_lower_idx ON tags ((lower(tag_name)));

CREATE TABLE posting_tags (
    post_id bigint REFERENCES job_posting(post_id),
    tag_id bigint REFERENCES tags(tag_id),
    PRIMARY KEY(post_id, tag_id)
);
CREATE INDEX posting_tags_idx ON posting_tags(tag_id);

CREATE TABLE candidate_tags (
    candidate_id bigint REFERENCES candidate(candidate_id),
    tag_id bigint REFERENCES tags(tag_id),
    PRIMARY KEY(candidate_id, tag_id)
);
CREATE INDEX candidate_tags_idx ON candidate_tags(tag_id);

CREATE VIEW user_master AS 
SELECT 
    l.created_on, l.user_id, l.user_type_id, l.last_login, l.email, ut.user_type_name, ec.employer_id,
    coalesce(c.first_name, r.first_name, ec.first_name) as first_name,
    coalesce(e.company_name, eec.company_name) as company_name,
    coalesce(c.last_name, r.last_name, ec.last_name) as last_name,
    coalesce(c.phone_number, r.phone_number, ec.phone_number) as phone_number,
    coalesce(c.rating, r.rating, e.rating) as rating,
    coalesce(c.active, r.active, ec.active) as active
FROM login l
INNER JOIN user_type ut ON ut.user_type_id = l.user_type_id
LEFT JOIN candidate c ON c.candidate_id = l.user_id
LEFT JOIN recruiter r ON r.recruiter_id = l.user_id
LEFT JOIN employer e ON e.employer_id = l.user_id
LEFT JOIN employer_contact ec ON ec.employer_contact_id = l.user_id
LEFT JOIN employer eec ON eec.employer_id = ec.employer_id;

-- DATA START
INSERT INTO user_type (user_type_name) VALUES
    ('Recruiter'),
    ('Employer Contact'),
    ('Candidate'),
    ('Employer');
INSERT INTO experience_type (experience_type_name) VALUES 
    ('Entry Level'),
    ('Mid Level'),
    ('Senior Level');
INSERT INTO salary_type (salary_type_name) VALUES 
    ('0k - 15k'),
    ('15k - 30k'),
    ('30k - 45k'),
    ('45k - 60k'),
    ('60k - 75k'),
    ('75k - 100k'),
    ('100k - 125k'),
    ('125k - 150k'),
    ('150k - 175k'),
    ('175k - 200k'),
    ('200k - 250k'),
    ('250k - 300k'),
    ('300k - 350k'),
    ('350k+');
-- FAKE DATA START
INSERT INTO tags (tag_name) VALUES
    ('SQL'),
    ('C++'),
    ('C#'),
    ('C'),
    ('Leadership'),
    ('Agile');
INSERT INTO login (user_id, email, passwordhash, created_on, user_type_id) VALUES 
    (1, 'r1@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-17 10:23:54', 1), -- Add Recruiter, pass: test
    (2, 'r2@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2018-11-25 10:23:54', 1), -- Add Recruiter, pass: test
    (3, 'r3@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2018-12-25 10:23:54', 1), -- Add Recruiter, pass: test
    (100, 'e1@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-01-21 10:23:54', 2), -- Add Employer, pass: test
    (101, 'e2@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Employer, pass: test
    (500, NULL, NULL, TIMESTAMP '2019-02-20 10:23:54', 4), -- Dummy Employer, pass: test
    (501, NULL, NULL, TIMESTAMP '2019-02-20 10:23:54', 4); -- Dummy Employer, pass: test
INSERT INTO login (user_id, email, created_on, user_type_id) VALUES 
    (1000, 'c1@test.com', TIMESTAMP '2019-02-17 10:23:54', 3), -- Add candidate
    (1001, 'c2@test.com', TIMESTAMP '2018-11-25 10:23:54', 3), -- Add candidate
    (1002, 'c3@test.com', TIMESTAMP '2018-12-25 10:23:54', 3), -- Add candidate
    (1003, 'c4@test.com', TIMESTAMP '2019-01-21 10:23:54', 3), -- Add candidate
    (1004, 'c5@test.com', TIMESTAMP '2019-02-20 10:23:54', 3), -- Add candidate
    (1005, 'c6@test.com', TIMESTAMP '2019-02-20 10:23:54', 3), -- Add candidate
    (1006, 'c7@test.com', TIMESTAMP '2019-02-20 10:23:54', 3), -- Add candidate
    (1007, 'c8@test.com', TIMESTAMP '2019-02-20 10:23:54', 3); -- Add candidate
INSERT INTO address (street_address_1, city, state, country, lat_lon) VALUES ('123 Main St.', 'Toronto', 'ON', 'CA', point(43.6531, -79.3831));
INSERT INTO address (street_address_1, city, state, country, lat_lon) VALUES ('4312 Dundas Rd.', 'Toronto', 'ON', 'CA', point(43.6533, -79.3833));
INSERT INTO address (street_address_1, city, state, country, lat_lon) VALUES ('21 Backersfield Rd.', 'North York', 'ON', 'CA', point(43.65335, -79.38325));
INSERT INTO address (street_address_1, street_address_2, city, state, country, lat_lon) VALUES ('654 York Rd.', 'Suite 203', 'Toronto', 'ON', 'CA', point(43.65325, -79.38312));
INSERT INTO address (street_address_1, street_address_2, city, state, country, lat_lon) VALUES ('1325 York Rd.', 'Building 3', 'Toronto', 'ON', 'CA', point(43.65324, -79.38328));
INSERT INTO employer (employer_id, company_name, address_id) VALUES
    (500, 'Google Inc.', 1), 
    (501, 'Microsoft Inc.', 2);
INSERT INTO employer_contact (employer_contact_id, employer_id, first_name, last_name, phone_number, isAdmin) VALUES
    (100, 500, 'Steve', 'Smith', '905-555-8942', true), 
    (101, 501, 'Jerry', 'McGuire', '905-555-0425', true);
INSERT INTO recruiter (recruiter_id, first_name, last_name, phone_number, coins, address_id) VALUES
    (1, 'John', 'Macabee', '443-555-8234', 25, 3),
    (2, 'Milton', 'Walker', '443-555-6456', 50, 4),
    (3, 'Jill', 'Stein', '443-555-3453', 32, 5);
INSERT INTO candidate (candidate_id, first_name, last_name) VALUES
    (1000, 'Sarah', 'Williams'),
    (1001, 'Amanda', 'Taylor'),
    (1002, 'Elizabeth ', 'Blaese'),
    (1003, 'Stephanie', 'Kim'),
    (1004, 'Nicholas ', 'Diaz'),
    (1005, 'Anton', 'Moore'),
    (1006, 'Chris', 'Roth'),
    (1007, 'Lukas', 'Page');
INSERT INTO recruiter_candidate (candidate_id, recruiter_id, created_on) VALUES
    (1000, 1, current_date - interval '1' day),
    (1001, 1, current_date - interval '2' day),
    (1001, 2, current_date - interval '2' day),
    (1002, 3, current_date - interval '3' day),
    (1003, 1, current_date - interval '4' day),
    (1004, 1, current_date - interval '5' day),
    (1005, 1, current_date - interval '6' day),
    (1005, 2, current_date - interval '6' day),
    (1006, 3, current_date - interval '7' day),
    (1007, 1, current_date - interval '8' day),
    (1007, 2, current_date - interval '8' day),
    (1007, 3, current_date - interval '8' day);
INSERT INTO job_posting (post_id, employer_id, created_on, title, caption, experience_type_id) VALUES
    (1, 500, current_date - interval '5' minute, 'Senior Software Developer - Working on exciting projects', 'We are a small company that develops solutions to protect national security and everyday folks. That includes OS integration; programming in C, C++, Java, Scala, Python, JS, or whatever the job calls for; writing security policies, and everything in between.', 2),
    (2, 501, current_date - interval '1' hour, 'Software Developer', 'As a software developer, you will be a key individual contributor on a sprint team building the future software at the core of the business. The role is for a full stack developer with the ability to develop solutions for the user interface, business logic, persistence layer and data store. Developers are responsible for implementing well-defined requirements as part of the sprint team including unit tests.', null),
    (3, 500, current_date - interval '3' hour, 'Director of Technical Support', 'As Director of Technical Support for Tenable, you will provide strategic direction, leadership, development and management with our Americas Technical Support team. The Director of Technical Support is an experienced, enthusiastic, hands-on leader focused on building a world class Technical Support organization that is focused on delivering customer success. You will be the conduit between the Technical Support team, Customer Success Management team, Product and Development teams, and other internal stakeholders developing a trusted advisor relationship that enables rapid, focused, resolution for our customers. To be successful in this role, the Director of Technical Support must have the right combination of strategy, leadership and operational skills to manage a growing team of dedicated Technical Support Engineers.', 3),
    (4, 501, current_date - interval '1' day, 'IT Director', 'The primary directive of the IT Director is to ensure that the technology and computing needs of the company are met. The candidate will work with executive leadership to help develop and maintain an IT roadmap keeping the company�s future objectives in mind. This position requires significant hands-on technical knowledge and expertise coupled with solid business knowledge. The IT Director must be able to collaborate with internal customers to identify and prioritize business requirements and deliver business and technology solutions with a focus on process transformation from planning through implementation. They will support the organizational initiative of process re-engineering by involving client departments in process flow analysis and work re-design. ', 3);

INSERT INTO job_posting_contact (post_id, employer_contact_id) VALUES
    (1, 100),
    (2, 101),
    (3, 100),
    (4, 101);

INSERT INTO candidate_posting (post_id, candidate_id, recruiter_id, coins, created_on, responded_on, has_seen_post, has_seen_response, accepted, not_accepted, comment) VALUES
    (1, 1000, 1, 10, current_date - interval '1' day, current_date - interval '0' day, true, false, true, false, 'I think this Sarah would be great for the job'),
    (1, 1001, 2, 5, current_date - interval '2' day, current_date - interval '1' day, true, false, false, true, 'Amanda has all of the skills you need'),
    (1, 1002, 3, 1, current_date - interval '1' day, NULL, false, false, false, false, 'Beth is very respectable and I think she will be a great addition to your team'),
    (2, 1003, 1, 2, current_date - interval '3' day, current_date - interval '2' day, true, true, true, false, 'Stephanie meets your criteria exactly, please have a look at her resume'),
    (2, 1004, 1, 20, current_date - interval '4' day, current_date - interval '3' day, true, false, true, false, null),
    (2, 1005, 2, 30, current_date - interval '2', NULL, false, false, false, false, null),
    (3, 1006, 3, 6, current_date - interval '5' day, current_date - interval '4' day, true, true, true, false, null),
    (3, 1007, 1, 7, current_date - interval '3' day, current_date - interval '1' day, true, false, false, true, null),
    (3, 1000, 1, 4, current_date - interval '2' day, NULL, false, false, false, false, 'I think this Sarah would be great for the job'),
    (3, 1001, 2, 4, current_date - interval '1' day, current_date - interval '0' day, true, true, true, false, 'Amanda has all of the skills you need'),
    (4, 1002, 3, 20, current_date - interval '3' day, current_date - interval '2' day, true, false, false, true, 'Beth is very respectable and I think she will be a great addition to your team'),
    (4, 1003, 1, 9, current_date - interval '4' day, current_date - interval '3' day, true, true, true, false, 'Stephanie meets your criteria exactly, please have a look at her resume'),
    (4, 1004, 1, 8, current_date - interval '5' day, current_date - interval '4' day, true, false, false, true, null),
    (4, 1000, 1, 1, current_date - interval '2' day, NULL, false, false, false, false, 'I think this Sarah would be great for the position you have open');
INSERT INTO posting_tags (post_id, tag_id) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 5),
    (2, 1),
    (2, 3),
    (2, 4),
    (3, 4),
    (3, 5),
    (4, 4);
INSERT INTO candidate_tags (candidate_id, tag_id) VALUES
    (1000, 1),
    (1001, 2),
    (1002, 3),
    (1003, 4),
    (1004, 5),
    (1005, 1),
    (1006, 3),
    (1007, 4),
    (1000, 4),
    (1001, 5),
    (1002, 4);
INSERT INTO messages (user_id_1, user_id_2, to_id, subject_user_id, post_id, subject, message, created_on) VALUES
    (1, 500, 1, 1000, 1, 'Sarah Sounds Great!', 'We would like to hear more about sarah.', current_date - interval '6' day),
    (1, 500, 500, 1000, 1, 'Sarah Sounds Great!', 'She is a really excellent candidate, she has a lot of expierence as a senior software developer and has run many teams, including a 30 person team in her last job.', current_date - interval '5' day),
    (1, 500, 1, 1000, 1, 'Sarah Sounds Great!', 'That sounds great please send me a call at 3pm on tuesday for a follow-up.', current_date - interval '4' day),
    (1, 500, 500, 1000, 1, 'Sarah Sounds Great!', '3PM that sounds perfect!', current_date - interval '3' day),
    (3, 500, 3, 1006, 3, 'Moving forward with Stephanie', 'We would like to move forward with Stephanie, can we please set up a time for a call this week', current_date - interval '10' day),
    (3, 500, 500, 1006, 3, 'Moving forward with Stephanie', 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', current_date - interval '9' day),
    (3, 500, 3, 1006, 3, 'Moving forward with Stephanie', 'Actually, I have a meeting at 2, lets do 3:30PM', current_date - interval '8' day),
    (3, 500, 500, 1006, 3, 'Moving forward with Stephanie', 'Yes that works, I look forward to hearing from you.', current_date - interval '7' day),
    (3, 500, 3, 1006, 3, 'Moving forward with Stephanie', 'We would like to move forward with Stephanie, can we please set up a time for a call this week', current_date - interval '6' day),
    (3, 500, 500, 1006, 3, 'Moving forward with Stephanie', 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', current_date - interval '5' day),
    (3, 500, 3, 1006, 3, 'Moving forward with Stephanie', 'Actually, I have a meeting at 2, lets do 3:30PM', current_date - interval '4' day),
    (3, 500, 500, 1006, 3, 'Moving forward with Stephanie', 'Yes that works, I look forward to hearing from you.', current_date - interval '3' day),
    (3, 500, 3, 1006, 3, 'Moving forward with Stephanie', 'We would like to move forward with Stephanie, can we please set up a time for a call this week', current_date - interval '2' day),
    (3, 500, 500, 1006, 3, 'Moving forward with Stephanie', 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', current_date - interval '1' day),
    (3, 500, 3, 1006, 3, 'Moving forward with Stephanie', 'Actually, I have a meeting at 2, lets do 3:30PM', current_date - interval '12' hour),
    (3, 500, 500, 1006, 3, 'Moving forward with Stephanie', 'Yes that works, I look forward to hearing from you.', current_date - interval '11' hour),
    (3, 500, 3, 1006, 3, 'Moving forward with Stephanie', 'We would like to move forward with Stephanie, can we please set up a time for a call this week', current_date - interval '10' hour),
    (3, 500, 500, 1006, 3, 'Moving forward with Stephanie', 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', current_date - interval '9' hour),
    (3, 500, 3, 1006, 3, 'Moving forward with Stephanie', 'Actually, I have a meeting at 2, lets do 3:30PM', current_date - interval '8' hour),
    (3, 500, 500, 1006, 3, 'Moving forward with Stephanie', 'Yes that works, I look forward to hearing from you.', current_date - interval '7' hour);
