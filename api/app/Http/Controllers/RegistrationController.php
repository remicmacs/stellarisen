<?php

namespace App\Http\Controllers;

use App\Model\UserDAO;
use App\Model\User;
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

      $password = (!empty($_POST['password']) ? $_POST['password'] : null);
      $repassword = (
        !empty($_POST['repassword'])
        ? $_POST['repassword']
        : null
      );

      // Control user password matches

      if (
        $password === null
        || $repassword === null
        || $password !== $repassword
      ) {
          $content = array(
            "registrationError" =>
            "Password and confirmation do not match, please try again"
          );

          return response($content, 400);
      }

      $hash = \password_hash($password, PASSWORD_BCRYPT);

      // Instantiate user and save to db
      $user = new User();
      $user->setUsername($username);
      $user->setHash($hash);

      try {
        $user = $this->userDAO->insertUser($user);

      // Catching error inserting in database
      } catch (\Illuminate\Database\QueryException $e) {
        // Test if integrity constraint violation or not
        $haystack = $e->getMessage();
        $needle = "Integrity constraint violation";
        if (strpos($haystack, $needle) !== false) {
          $content = array(
            "registrationError" =>
            "Username already taken, please try another"
          );

          $statusCode = 400;

        } else {
          $content = array(
            "registrationFailure" =>
            "Unidentified failure.".
            "Database might be unavailable, please contact the webmaster"
          );

          $statusCode = 500;
        }

        return response($content, $statusCode);
      }

      // Create JWT and add to cookie

      $userId = $user->getUserId();

      $content = array("userId:" => $userId,
        "registrationSuccess" =>
          "New user correctly inserted in database with userId ".$userId
      );

      return response($content);
  }
}