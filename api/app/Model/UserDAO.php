<?php

namespace App\Model;

use App\Model\DAO;
use App\Model\User;
use App\Exceptions\NoSuchUserException;

class UserDAO implements DAO {
  public function insertUser(User $user) :User {

    // Inserting new user into table and retrieving auto-incremented id
    $userId = app('db')->table('users')->insertGetId(
      ['username' => $user->getUsername(), 'hash' => $user->getHash()]
    );

    // Setting the userId of the current DTO for now
    $user->setUserId($userId);

    return $user;
  }

  public function getById(string $id) {
    $user = new User();
    $rows = app('db')->table('users')->where('userid', (int) $id)->get();

    return $user;
  }

  /**
   * Get a user by username
   *
   * @throws NoSuchUserException when the username does not match any user
   * @param string $username
   * @return User
   */
  public function getByUsername(string $username):User {
    $user = new User();
    $rows = app('db')->table('users')->where('username', $username)->get();
    if($rows->isEmpty()) throw new NoSuchUserException(
      "User '".$username."' does not exist. Would you like to register ?"
    );

    $row = $rows->first();

    $username = $row->username;
    $userid = $row->userid;
    $hash = $row->hash;

    $user->setUserId($userid);
    $user->setUsername($username);
    $user->setHash($hash);


    /*
    foreach($rows as $user) {
      $username2 = $user->name;
    }*/

    return $user;
  }
}