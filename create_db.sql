drop table if exists users;

create table users(
  userid int(10) not null primary key auto_increment,
  username varchar(255) not null unique,
  hash varchar(60) not null,
  INDEX (username)
);