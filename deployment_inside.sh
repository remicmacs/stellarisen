#! /usr/bin/env bash

password="different"
repassword="passwords"

# Password prompt for database user
echo -n "Enter a new password for database user : "
read -s password

printf "\n"

echo -n "Please confirm : "
read -s repassword
printf "\n"

while [ x"$password" != x"$repassword" ]; do
    printf "Sorry, passwords do not match. Please try again.\n"
    echo -n "Enter a new password for database user : "
    read -s password

    printf "\n"

    echo -n "Please confirm : "
    read -s repassword
    printf "\n"
done

# TODO: Modify password in .env file by copying .env.example file line by line
# and modifying only the correct line

# MySQL user and database creation
mysql -u "root" -p"123" -e "source /var/www/stellarisen/create_user_and_db.sql;\
set password for 'stellarisen'@'%' := PASSWORD( '${password}' );"

# Table creation and insertion of celestial bodies
mysql -u "stellarisen" -D "stellarisen" -p"${password}" -e "source \
/var/www/stellarisen/create_tables.sql;"