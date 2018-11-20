<?php

namespace App\Http\Controllers;

use App\Model\UserDAO;
use App\Model\User;
use App\Factories\JWTFactory;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie; // To add a cookie to headers


/**
 * Controller to handle registration requests
 */
class RegistrationController extends Controller {
  private $userDAO;
  private $JWTFactory;

  /**
   * Constructor with Dependancy Injections
   *
   * @param UserDAO $userDAO
   * @param JWTFactory $JWTFactory
   */
  public function __construct(UserDAO $userDAO, JWTFactory $JWTFactory) {
    $this->userDAO = $userDAO;
    $this->JWTFactory = $JWTFactory;
  }

  /**
   * Handles incoming register requests
   *
   * @param Request $request
   * @return void
   */
  public function register(Request $request) {
        // Sometimes, $_POST is unset, if the connection does not come from
        // dedicated web app.
      $username = filter_input(
        INPUT_POST, 'username',
        FILTER_SANITIZE_FULL_SPECIAL_CHARS
      );

      // Control user already exists
      if ($this->userDAO->isUsernameused($username)) {
        $content = array(
          "registrationError" =>
          "Username already taken, please try another"
        );

        $statusCode = 400;
        return response($content, $statusCode);
      }

      // Control user password match
      $password = (!empty($_POST['password']) ? $_POST['password'] : null);
      $repassword = (
        !empty($_POST['repassword'])
        ? $_POST['repassword']
        : null
      );

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

      // Hashing validated password
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

        /*
         * If it is an integrity constraint violation, it means that the
         * username is already taken, which should have already be checked.
         * I'm not sure this code is used anymore
         */
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

      $userId = $user->getUserId();

      $content = array("userId:" => $userId,
      "registrationSuccess" =>
      "New user correctly inserted in database with userId ".$userId
    );

    // Create JWT and add to cookie
    $token = $this->JWTFactory->getToken($user);
      return response($content)->cookie(
        new Cookie(
            "access_token",
            $token,
            // no point in keeping the cookie longer than the validity
            //   of the JWT it holds
            time() + 3600,
            '/',
            null,
            // Secure flag
            // set to true once in production (for secure HTTPS cookie)
            false,
            // HttpOnly flag : forbids the JS to access the token
            true
        )
    );
  }
}