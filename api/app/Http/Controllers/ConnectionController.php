<?php
namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\Cookie; // To add a cookie to headers
use App\Model\UserDAO; // Repository object to access Users in database
use App\Exceptions\AuthenticationFailureException;
use App\Factories\JWTFactory; // To build a JWT to attach to response


/**
 * ConnectionController
 *
 * Controller for authentication process
 */
class ConnectionController extends Controller
{
    private $userDAO;
    private $JWTFactory;

    /**
     * Constructor for ConnectionController
     *
     * Injects DAO object and JWTFactory
     *
     * @param UserDAO $userDAO
     */
    public function __construct(UserDAO $userDAO, JWTFactory $JWTFactory){
        // DI of Repository object
        $this->userDAO = $userDAO;

        $this->JWTFactory = $JWTFactory;
    }

    /**
     * Login handler for AJAJ connection
     *
     * @return Illuminate\Http\Response
     */
    public function connect() {
        // Recover form data
        // Sometimes, $_POST is unset, if the connection does not come from
        // dedicated web app.
        $username = filter_input(
            INPUT_POST, 'username',
            FILTER_SANITIZE_FULL_SPECIAL_CHARS
        );
        $password = (!empty($_POST['password']) ? $_POST['password'] : null);

        // If any of the vars is null, it means it was not set in $_POST
        // superglobal variable upon receiving request.
        if ($username === null || $password === null) {
            throw new AuthenticationFailureException(
                "Authentication failure : missing credentials"
            );
        }

        // User credentials verification
        $user = $this->userDAO->getByUsername($username);
        if(!password_verify($password, $user->getHash())) {
            throw new AuthenticationFailureException(
                "Authentication failure : bad password"
            );
        }

        // Recovering a JWT
        $token = $this->JWTFactory->getToken($user);

        // Attaching JWT to response
        $content = array(
            "Message" => 'JWT correctly set as "access_token" cookie'
        );

        // Send response with token in cookie
        return response($content)
            ->cookie(
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
