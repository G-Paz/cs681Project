-- create auth schema
create schema user_auth;

-- grant create to gamemaster in chess
grant usage on schema user_auth to gamemaster;
grant usage on schema user_auth to iam_app;

-- create user table
create table user_auth.user(user_id integer not null, first_name text not null, token text, email_address text not null, creation_date timestamptz not null, active boolean not null, modified_time timestamptz not null);

-- add table constraints
alter table user_auth.user add constraint user_pk primary key (user_id);
alter table user_auth.user add constraint user_uk01 unique (email_address);

-- grant permissions to user table
grant select, insert on table user_auth.user to iam_app;
grant update (active, modified_time) on user_auth.user to iam_app;
grant select, insert, delete, update on table user_auth.user to gamemaster;

-- create sequence for the user table
create sequence user_auth.user_id_seq start 100;

-- add default value to the user_id column in the user table
alter table user_auth.user alter user_id set default nextval('user_auth.user_id_seq');

-- grant permissions to user_seq sequence
grant usage on sequence user_auth.user_id_seq to iam_app;
grant usage on sequence user_auth.user_id_seq to gamemaster;

-- create role table
create table user_auth.role(role_id integer not null, role_name text not null);

-- add table constraints
alter table user_auth.role add constraint role_pk primary key (role_id);
alter table user_auth.role add constraint role_uk01 unique (role_name);

-- grant permissions to role table
grant select on table user_auth.role to iam_app;
grant select, insert, delete, update on table user_auth.role to gamemaster;

-- create role table
create table user_auth.permission(permission_id integer not null, permission_name text not null);

-- add table constraints
alter table user_auth.permission add constraint permission_pk primary key (permission_id);
alter table user_auth.permission add constraint permission_uk01 unique (permission_name);

-- grant permissions to permission table
grant select on table user_auth.permission to iam_app;
grant select, insert, delete, update on table user_auth.permission to gamemaster;

-- create role table
create table user_auth.role_permission(role_id integer not null, permission_id integer not null);

-- add table constraints
alter table user_auth.role_permission add constraint role_permission_pk primary key (role_id, permission_id);
alter table user_auth.role_permission add constraint role_permission_fk01 foreign key (permission_id) references user_auth.permission(permission_id);
alter table user_auth.role_permission add constraint role_permission_fk02 foreign key (role_id) references user_auth.role(role_id);

-- grant permissions to role_permission table
grant select on table user_auth.role_permission to iam_app;
grant select, insert, delete, update on table user_auth.role_permission to gamemaster;

-- create role table
create table user_auth.user_role(user_id integer not null, role_id integer not null);

-- add table constraints
alter table user_auth.user_role add constraint user_role_pk primary key (user_id, role_id);
alter table user_auth.user_role add constraint user_role_fk01 foreign key (user_id) references user_auth.user(user_id);
alter table user_auth.user_role add constraint user_role_fk02 foreign key (role_id) references user_auth.role(role_id);

-- grant permissions to role_permission table
grant select, insert  on table user_auth.user_role to iam_app;
grant select, insert, delete, update on table user_auth.user_role to gamemaster;

-- create role table
create table user_auth.user_sec(user_id integer not null, user_pass text not null, salt text not null);

-- add table constraints
alter table user_auth.user_sec add constraint user_sec_pk primary key (user_id, user_pass);
alter table user_auth.user_sec add constraint user_sec_fk01 foreign key (user_id) references user_auth.user(user_id);

-- grant permissions to role_permission table
grant select, insert on table user_auth.user_sec to iam_app;
grant select, insert, delete, update on table user_auth.user_sec to gamemaster;
