<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;

/**
 * ConnectionController
 *
 * Controller for authentication process
 */
class ConnectionController extends Controller
{
    private $jwt_secret;
    /**
     * Create a new controller instance.
     *
     * @TODO: dependancy injection on UserRepository object
     *
     * @return void
     */
    public function __construct()
    {
        // Recover config values
        $this->jwt_secret = env("JWT_SECRET");

        // Maybe DI of Repository object
    }

    /**
     * Login handler for AJAJ connection
     *
     * @return Illuminate\Http\Response
     */
    public function connect() {
        // Sometimes, $_POST is unset, if the connection does not come from
        // dedicated web app.
        $username = filter_input(
            INPUT_POST, 'username',
            FILTER_SANITIZE_FULL_SPECIAL_CHARS
        );
        $password = filter_input(
            INPUT_POST,
            'password',
            FILTER_SANITIZE_FULL_SPECIAL_CHARS
        );

        // If any of the vars is null, it means it was not set in $_POST
        // superglobal variable upon receiving request.
        if ($username === null || $password === null
            || $username !== "remicmacs" || $password !== "prout"
        ) {

            // @TODO
            // User credentials verification should take place here

            // Add a message to display in modal window
            return response(array("error", "Authentication failure"), 401)
                ->header("Content-type", "application/json");
        }

        // Must instantiate signer for signature
        $signer = new Sha256();
        // Manage JWT (Javascript Web Token) creation
        $issuer_url = $_ENV['APP_URL'];
        // Trying to make jti as unique as possible
        $jti_claim = hash("sha256", $username.(time()));
        $token = (new Builder())
            // iss claim = issuer of the token
            ->setIssuer($issuer_url)
            // aud claim = target audience for the token
            ->setAudience($issuer_url)
            // jti claim = unique id that will not have hash collision with
            //    another generated JWT
            ->setId($jti_claim, true)
            // iat claim = timestamp when the JWT has been generated
            ->setIssuedAt(time())
            // nbf claim = timestamp of the beginning of the JWT validity period
            ->setNotBefore(time() + 1)
            // exp claim = timestamp for expiration time
            ->setExpiration(time() + 3600)
            // Set uid to avoid to recover uid every time in database
            ->set('uid', 1)
            // Signing the JWT
            ->sign($signer, $this->jwt_secret)
            // Retrieves the generated token
            ->getToken();

        // Forcing token to be in string value
        // __tostring() magin method of Token encodes in base64 and concatenates
        // every three part of JWT (headers.claims.signature)
        $token = (string) $token;

        // Attaching JWT to response
        $content = array("JWT" => $token);
        $value = "application/json";
        return response($content)
            ->header("Content-type", "application/json");
    }
}
