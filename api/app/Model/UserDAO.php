<?php

namespace App\Model;

use App\Model\DAO;
use App\Model\User;
//use Illuminate\Support\Facades\DB;
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
}