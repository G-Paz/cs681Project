-- create new chess database to manage the game states
insert into user_auth.user
(user_id,  first_name,    last_name, email_address,     creation_date, active,     modified_time)
values
(3,      'user1Fname', 'user1Lname',            'user1email', current_timestamp,   true, current_timestamp),
(2,      'user2Fname', 'user2Lname',            'user2email', current_timestamp,  false, current_timestamp),
(1,           'admin', 'gamemaster',         'tbd', current_timestamp,   true, current_timestamp);

insert into user_auth.role
(role_id, role_name)
values
(      1,   'admin'),
(      2, 'fischer');

insert into user_auth.permission
(permission_id, permission_name)
values
(            1, 'create_game'),
(            2, 'find_game'),
(            3, 'view_game'),
(            4, 'user_analytics'),
(            5, 'manage_single_user'),
(            6, 'manage_all_users'),
(            7, 'terminate_active_game'),
(            8, 'view_all_games'),
(            9, 'all_user_analytics'),
(           10, 'deactive_users');

insert into user_auth.role_permission
(role_id, permission_id)
values
(      1,             1),
(      1,             2),
(      1,             3),
(      1,             4),
(      1,             5),
(      1,             6),
(      1,             7),
(      1,             8),
(      1,             9),
(      1,            10),
(      2,             1),
(      2,             2),
(      2,             3),
(      2,             4),
(      2,             5);


insert into user_auth.user_role
(user_id, role_id)
values
(      3,             1),
(      2,             2),
(      1,             2);


insert into user_auth.user_sec
(user_id, user_pass, auth_code)
values
(      3,             '3', '3'),
(      2,             '2', '2'),
(      1,             '1', '1');