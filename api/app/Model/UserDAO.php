<?php

namespace App\Model;

use App\Model\DAO;
use App\Model\User;
use App\Exceptions\NoSuchUserException;

/**
 * Repository object to access database information of users
 */
class UserDAO implements DAO {

  /**
   * Insert a new user in database
   *
   * @param User $user
   * @return User Return the user object with its given user id
   */
  public function insertUser(User $user) :User {

    // Inserting new user into table and retrieving auto-incremented id
    $userId = app('db')->table('users')->insertGetId(
      ['username' => $user->getUsername(), 'hash' => $user->getHash()]
    );

    // Setting the userId of the current DTO for now
    $user->setUserId($userId);

    return $user;
  }

  /**
   * Recover a User based on its unique ID
   *
   * @throws NoSuchUserException when the userid does not match any user
   * @param string $id
   * @return void
   */
  public function getById(string $id) {
    $row = app('db')->table('users')->where('userid', (int) $id)->get()
      ->first();

    // No result in database
    if ($row === null) throw new NoSuchUserException(
      "Userid '".$id."' not found. Naughty you!!"
    );

    return $this->hydrate($row);
  }

  /**
   * Get a user by username
   *
   * @throws NoSuchUserException when the username does not match any user
   * @param string $username
   * @return User
   */
  public function getByUsername(string $username):User {
    $rows = app('db')->table('users')->where('username', $username)->get();
    if($rows->isEmpty()) throw new NoSuchUserException(
      "User '".$username."' does not exist. Would you like to register ?"
    );

    $row = $rows->first();

    $user = $this->hydrate($row);

    return $user;
  }

  public function isUsernameUsed($username):bool {
    try {
      $this->getByUsername($username);
    } catch (NoSuchUserException $exception) {
      return false;
    }
    return true;
  }

  /**
   * Takes one row from table Users to instantiate it as a User object
   *
   * @param stdClass $row
   * @return void
   */
  private function hydrate($row) {
    $user = new User();
    $username = $row->username;
    $userid = $row->userid;
    $hash = $row->hash;

    $user->setUserId($userid);
    $user->setUsername($username);
    $user->setHash($hash);

    return $user;
  }
}