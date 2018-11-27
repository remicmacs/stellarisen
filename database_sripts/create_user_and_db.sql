-- If database has already been created and user wants to start fresh
DROP USER IF EXISTS stellarisen;
DROP DATABASE IF EXISTS stellarisen;

-- Disable old_passwords to have the proper hash length for SET PASSWORD
SET old_passwords = 0;

CREATE USER 'stellarisen'@'%'
  IDENTIFIED VIA mysql_native_password;

-- Permissions
GRANT USAGE ON *.* TO 'stellarisen'@'%' REQUIRE NONE
  WITH MAX_QUERIES_PER_HOUR 0
  MAX_CONNECTIONS_PER_HOUR 0
  MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;

CREATE DATABASE IF NOT EXISTS `stellarisen`
  CHARACTER SET `utf8mb4`;

-- Permission 2, le retour
GRANT ALL PRIVILEGES ON `stellarisen`.* TO 'stellarisen'@'%';

-- Shell script sets the password after this script