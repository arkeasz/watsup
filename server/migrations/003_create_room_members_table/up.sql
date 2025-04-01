create table room_members (
  id bigint primary key generated always as identity,
  user_id bigint not null references users (id),
  room_id bigint not null references rooms (id),
  joined_at timestamp with time zone default now(),
  is_owner boolean,
  unique (user_id, room_id)
);
