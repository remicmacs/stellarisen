-- SELECT @userpassword ;

DROP USER IF EXISTS stellarisen;
DROP DATABASE IF EXISTS stellarisen;
SET old_passwords = 0;
CREATE USER 'stellarisen'@'%'
  IDENTIFIED VIA mysql_native_password;
-- SET @hashed := PASSWORD(@userpassword );
-- SELECT @hashed ;
-- SET PASSWORD FOR 'stellarisen'@'%' := @hashed ;
set password for 'stellarisen'@'%' := PASSWORD( @userpassword );
GRANT USAGE ON *.* TO 'stellarisen'@'%' REQUIRE NONE
  WITH MAX_QUERIES_PER_HOUR 0
  MAX_CONNECTIONS_PER_HOUR 0
  MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;
CREATE DATABASE IF NOT EXISTS `stellarisen`
  CHARACTER SET `utf8mb4`;
GRANT ALL PRIVILEGES ON `stellarisen`.* TO 'stellarisen'@'%';
