-- create new chess database to manage the game states
insert into user_auth.role
(role_id, role_name)
values
(      1,   'admin'),
(      2, 'hikaru');

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