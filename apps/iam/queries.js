const queries = {}

// query to create user entry - returns id of the user created
queries.CREATE_USER_SQL = 'insert into user_auth.user '
                        + '(first_name,     token, username, creation_date, active,     modified_time) '
                        + 'values '
                        + '(  $1::text,  $2::text, $1::text,  current_date,   true, current_timestamp) '
                        + 'returning user_id;';

// query to select user secuirty entry - returns id of the user created
queries.SELECT_USER_SEC = 'select us.user_id   as user_id, '
                        + '       us.user_pass as user_pass, '
                        + '       us.salt      as salt, '
                        + '       r.role_name  as role_name '
                        + 'from user_auth.user      as u '
                        + 'join user_auth.user_sec  as us on (us.user_id = u.user_id) '
                        + 'join user_auth.user_role as ur on (ur.user_id = us.user_id) '
                        + 'join user_auth.role      as r  on (r.role_id = ur.role_id) '
                        + 'where u.username = $1::text ;';
                        
// update token query
queries.UPDATE_USER_TOKEN = 'update user_auth.user set token = $2, modified_time = current_timestamp where user_id = $1;';

// get the last token
queries.GET_USER_TOKEN = 'select token, modified_time from user_auth.user where user_id = $1;';

// query to create user_seq entry
queries.CREATE_USER_SEQ_SQL = 'insert into user_auth.user_sec '
                            + '(     user_id, user_pass,     salt) '
                            + 'values '
                            + '( $1::integer,  $2::text, $3::text);';

// query to create user_seq entry
queries.ASSIGN_ROLE_TO_USER = 'insert into user_auth.user_role '
                            + '(user_id, role_id) '
                            + 'values '
                            + '(     $1,      $2);';

export default queries;