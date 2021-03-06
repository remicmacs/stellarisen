#! /usr/bin/env bash
echo '$$\   $$\           $$\ $$\                                   ';
echo '$$ |  $$ |          $$ |$$ |                                  ';
echo '$$ |  $$ | $$$$$$\  $$ |$$ | $$$$$$\                          ';
echo '$$$$$$$$ |$$  __$$\ $$ |$$ |$$  __$$\                         ';
echo '$$  __$$ |$$$$$$$$ |$$ |$$ |$$ /  $$ |                        ';
echo '$$ |  $$ |$$   ____|$$ |$$ |$$ |  $$ |                        ';
echo '$$ |  $$ |\$$$$$$$\ $$ |$$ |\$$$$$$  |$$\                     ';
echo '\__|  \__| \_______|\__|\__| \______/ $  |                    ';
echo '                                      \_/                     ';
echo '                                                              ';
echo '                                                              ';
echo '                                  $$\       $$\       $$\ $$\ ';
echo '                                  $$ |      $$ |      $$ |$$ |';
echo '$$\  $$\  $$\  $$$$$$\   $$$$$$\  $$ | $$$$$$$ |      $$ |$$ |';
echo '$$ | $$ | $$ |$$  __$$\ $$  __$$\ $$ |$$  __$$ |      $$ |$$ |';
echo '$$ | $$ | $$ |$$ /  $$ |$$ |  \__|$$ |$$ /  $$ |      \__|\__|';
echo '$$ | $$ | $$ |$$ |  $$ |$$ |      $$ |$$ |  $$ |              ';
echo '\$$$$$\$$$$  |\$$$$$$  |$$ |      $$ |\$$$$$$$ |      $$\ $$\ ';
echo ' \_____\____/  \______/ \__|      \__| \_______|      \__|\__|';
echo '                                                              ';
echo '                                                              ';
echo '                                                              ';


printf "This script is made to help the user deploy the application for the \n"
printf "\"Stellar'ISEN\" school project.\n\n"

# Installing dependancies
$(cd api/ && composer install);
printf "\n\n"

# Ensure script is run from inside the VM, in the correct folder
if [ x"$PWD" != x"/var/www/stellarisen" ] \
&& [ x"$HOSTNAME" != x"stellarisen-lamp" ]; then
    printf 'This script should be run inside the `/var/www/stellarisen` folder\n'
    printf 'of the provided Vagrant box.\n'
    printf "Used in another way this script will probably fail.\n\n"
    echo "Exiting..."
    exit 1
fi

# password="different"
# repassword="passwords"

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


# Generating a random secret string for JWTs
printf "Generating application secret ...\n"
jwtsecret=$(pwgen -s 65 1 )

printf "Creating database... "
# MySQL user and database creation
mysql --abort-source-on-error -u "root" -p"123" \
-e "source /var/www/stellarisen/database_scripts/create_user_and_db.sql; \
set password for 'stellarisen'@'%' := PASSWORD( '${password}' );"

exitcode=$?
if [ $exitcode -ne 0 ]; then
    printf "Failure!\nMySQL error while creating database !!\n"
    printf "Exiting ..."
    exit 1
fi

# Table creation and insertion of celestial bodies
mysql --abort-source-on-error -u "stellarisen" -D "stellarisen" \
-p"${password}" -e "source /var/www/stellarisen/database_scripts/create_tables.sql;"

exitcode=$?
if [ $exitcode -ne 0 ]; then
    printf "Failure!\nMySQL error while creating tables !!\n"
    printf "Exiting ..."
    exit 1
fi

printf "Success !! \n"

# Generation of .env conf ig file.
envfile="api/.env"
referenceenvfile="api/.env.example"

if [ ! -f api/.env.example ]; then
    echo "Fatal error : reference config file not found."
    echo "Please clone git repository and try again"
    echo "Exiting..."
    exit 1
fi

# Reference for example file parsing
dbpwline="DB_PASSWORD=database_user_password_generated_during_deployment"
apisecretline="JWT_SECRET=a_strong_secret_generated_with_at_least_32_chars"

# Deleting and creating environment file
if [ -f api/.env ]; then
    rm api/.env;
fi

touch api/.env

printf "Generating configuration file... "
IFS=''
while read line
do
    if [ x"$line" == x"$dbpwline" ]; then
        echo "DB_PASSWORD=${password}" >> api/.env
    elif [ x"$line" == x"$apisecretline" ]; then
        echo "JWT_SECRET=${jwtsecret}" >> api/.env
    else
        echo $line >> api/.env
    fi
done < api/.env.example

printf "All done !\nHappy hacking!!"