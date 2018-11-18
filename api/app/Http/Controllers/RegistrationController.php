<?php

namespace App\Http\Controllers;

use App\Model\UserDAO;
use Illuminate\Http\Request;


class RegistrationController extends Controller {
  private $userDAO;

  public function __construct(UserDAO $userDAO) {
    $this->userDAO = $userDAO;
  }

  public function register(Request $request) {
        // Sometimes, $_POST is unset, if the connection does not come from
        // dedicated web app.
      $username = filter_input(
        INPUT_POST, 'username',
        FILTER_SANITIZE_FULL_SPECIAL_CHARS
      );

      // Control user already exists

      $password = filter_input(
        INPUT_POST,
        'password',
        FILTER_SANITIZE_FULL_SPECIAL_CHARS
      );
      $repassword = filter_input(
        INPUT_POST,
        'repassword',
        FILTER_SANITIZE_FULL_SPECIAL_CHARS
      );

      // Control user password matches

      $hash = \password_hash($password, PASSWORD_BCRYPT);

      // Instantiate user and save to db

      // Create JWT and add to cookie

      $content = array("hash" => $hash, "length" => strlen($hash));

      return response($content)
      ->header("Content-type", "application/json");
  }
}