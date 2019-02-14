DROP TABLE posting_tags;
DROP TABLE candidate_tags;
DROP TABLE recruiter_candidate;
DROP TABLE candidate_posting;
DROP TABLE job_posting;
DROP TABLE recruiter;
DROP TABLE candidate;
DROP TABLE employer;
DROP TABLE address;
DROP INDEX login_lower_idx;
DROP TABLE login;
DROP TABLE user_type;
DROP TABLE experience_type;
DROP TABLE tags;

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
    coins int NOT NULL,
    PRIMARY KEY(recruiter_id)
);
CREATE TABLE job_posting (
    post_id bigserial,
    employer_id bigint REFERENCES employer(employer_id),
    title varchar(255) NOT NULL,
    caption varchar(2000) NOT NULL,
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
CREATE TABLE recruiter_candidate (
    candidate_id bigint REFERENCES candidate(candidate_id),
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    PRIMARY KEY(candidate_id, recruiter_id)
);
CREATE TABLE candidate_posting (
    candidate_id bigint REFERENCES candidate(candidate_id),
    post_id bigint REFERENCES job_posting(post_id),
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    coins int NOT NULL,
    PRIMARY KEY(candidate_id, post_id, recruiter_id)
);
CREATE TABLE tags (
    tag_id bigserial,
    tag_name varchar(64) NOT NULL,
    PRIMARY KEY(tag_id)
);
CREATE TABLE posting_tags (
    post_id bigint REFERENCES job_posting(post_id),
    tag_id bigint REFERENCES tags(tag_id),
    PRIMARY KEY(post_id, tag_id)
);
CREATE TABLE candidate_tags (
    candidate_id bigint REFERENCES candidate(candidate_id),
    tag_id bigint REFERENCES tags(tag_id),
    PRIMARY KEY(candidate_id, tag_id)
);
-- DATA START
INSERT INTO user_type (user_type_id, user_type_name) VALUES
    (1, 'Recruiter'),
    (2, 'Employer');
INSERT INTO experience_type (experience_type_id, experience_type_name) VALUES 
    (1, 'Entry Level'),
    (2, 'Mid Level'),
    (3, 'Senior Level');
-- FAKE DATA START
INSERT INTO tags (tag_name) VALUES
    ('SQL'),
    ('C++'),
    ('C#'),
    ('Leadership'),
    ('Agile');
INSERT INTO login (email, passwordhash, created_on, user_type_id) VALUES 
    ('r1@test.com', '9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08', TIMESTAMP '2015-04-28 10:23:54', 1), -- Add Recruiter, pass: test
    ('r2@test.com', '9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08', TIMESTAMP '2018-03-25 10:23:54', 1), -- Add Recruiter, pass: test
    ('r3@test.com', '9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08', TIMESTAMP '2018-03-25 10:23:54', 1), -- Add Recruiter, pass: test
    ('e1@test.com', '9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08', TIMESTAMP '2006-07-21 10:23:54', 2), -- Add Employer, pass: test
    ('e2@test.com', '9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08', TIMESTAMP '2008-02-28 10:23:54', 2); -- Add Employer, pass: test
INSERT INTO address (street_address_1, city, state, country, lat_lon) VALUES ('123 Main St.', 'Toronto', 'ON', 'CA', point(43.6531, -79.3831));
INSERT INTO address (street_address_1, city, state, country, lat_lon) VALUES ('4312 Dundas Rd.', 'Toronto', 'ON', 'CA', point(43.6533, -79.3833));
INSERT INTO address (street_address_1, city, state, country, lat_lon) VALUES ('21 Backersfield Rd.', 'North York', 'ON', 'CA', point(43.65335, -79.38325));
INSERT INTO address (street_address_1, street_address_2, city, state, country, lat_lon) VALUES ('654 York Rd.', 'Suite 203', 'Toronto', 'ON', 'CA', point(43.65325, -79.38312));
INSERT INTO address (street_address_1, street_address_2, city, state, country, lat_lon) VALUES ('1325 York Rd.', 'Building 3', 'Toronto', 'ON', 'CA', point(43.65324, -79.38328));
INSERT INTO employer (employer_id, contact_given_name, contact_family_name, contact_phone_number, company_name, address_id) VALUES
    (4, 'Steve', 'Smith', '905-555-8942', 'Google Inc.', 1), 
    (5, 'Jerry', 'McGuire', '905-555-0425', 'Microsoft Inc.', 2);
INSERT INTO recruiter (recruiter_id, given_name, family_name, phone_number, coins, address_id) VALUES
    (1, 'John', 'Macabee', '443-555-8234', 25, 3),
    (2, 'Milton', 'Walker', '443-555-6456', 50, 4),
    (3, 'Jill', 'Stein', '443-555-3453', 32, 5);
INSERT INTO candidate (given_name, family_name, email, created_on) VALUES
    ('Sarah', 'Williams', 'sarah.w@gmail.com', TIMESTAMP '2009-10-06 10:23:54'),
    ('Amanda', 'Taylor', 'amanda34@gmail.com', TIMESTAMP '2006-10-21 10:23:54'),
    ('Elizabeth ', 'Blaese ', 'beth.blaese@hotmail.com', TIMESTAMP '2005-04-21 10:23:54'),
    ('Stephanie', 'Kim', 'stephanie.kim@gmail.com', TIMESTAMP '2003-10-04 10:23:54'),
    ('Nicholas ', 'Diaz', 'nick.diaz@gmail.com', TIMESTAMP '2002-01-30 10:23:54'),
    ('Anton', 'Moore', 'anton.moore@hotmail.com', TIMESTAMP '2001-10-01 10:23:54'),
    ('Chris', 'Roth', 'chrisroth@gmail.com', TIMESTAMP '2012-10-19 10:23:54'),
    ('Lukas', 'Page', 'lukaspage@gmail.com', TIMESTAMP '2007-06-22 10:23:54');
INSERT INTO recruiter_candidate (candidate_id, recruiter_id) VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 1),
    (5, 1),
    (6, 2),
    (7, 3),
    (8, 1);
INSERT INTO job_posting (employer_id, title, caption, experience_type_id) VALUES
    (4, 'Senior Software Developer - Working on exciting projects', 'We are a small company that develops solutions to protect national security and everyday folks. That includes OS integration; programming in C, C++, Java, Scala, Python, JS, or whatever the job calls for; writing security policies, and everything in between.', 2),
    (5, 'Software Developer', 'As a software developer, you will be a key individual contributor on a sprint team building the future software at the core of the business. The role is for a full stack developer with the ability to develop solutions for the user interface, business logic, persistence layer and data store. Developers are responsible for implementing well-defined requirements as part of the sprint team including unit tests.', null),
    (4, 'Director of Technical Support', 'As Director of Technical Support for Tenable, you will provide strategic direction, leadership, development and management with our Americas Technical Support team. The Director of Technical Support is an experienced, enthusiastic, hands-on leader focused on building a world class Technical Support organization that is focused on delivering customer success. You will be the conduit between the Technical Support team, Customer Success Management team, Product and Development teams, and other internal stakeholders developing a trusted advisor relationship that enables rapid, focused, resolution for our customers. To be successful in this role, the Director of Technical Support must have the right combination of strategy, leadership and operational skills to manage a growing team of dedicated Technical Support Engineers.', 3),
    (5, 'IT Director', 'The primary directive of the IT Director is to ensure that the technology and computing needs of the company are met. The candidate will work with executive leadership to help develop and maintain an IT roadmap keeping the company’s future objectives in mind. This position requires significant hands-on technical knowledge and expertise coupled with solid business knowledge. The IT Director must be able to collaborate with internal customers to identify and prioritize business requirements and deliver business and technology solutions with a focus on process transformation from planning through implementation. They will support the organizational initiative of process re-engineering by involving client departments in process flow analysis and work re-design. ', 3);
INSERT INTO candidate_posting (post_id, candidate_id, recruiter_id, coins) VALUES
    (1, 1, 1, 10),
    (1, 2, 2, 5),
    (1, 3, 3, 1),
    (2, 4, 1, 2),
    (2, 5, 1, 20),
    (2, 6, 2, 30),
    (3, 7, 3, 6),
    (3, 8, 1, 7),
    (3, 1, 1, 4),
    (3, 2, 2, 4),
    (4, 3, 3, 20),
    (4, 4, 1, 9),
    (4, 5, 1, 8),
    (4, 1, 1, 1);
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
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 5),
    (6, 1),
    (7, 3),
    (8, 4),
    (1, 4),
    (2, 5),
    (3, 4);
COMMIT;