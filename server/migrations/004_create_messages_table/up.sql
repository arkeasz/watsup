create table messages (
  id bigint primary key generated always as identity,
  room_id bigint not null references rooms (id),
  user_id bigint not null references users (id),
  content text not null,
  sent_at timestamp with time zone default now()
);
