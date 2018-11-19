<?php
/**
 * ApiAuthentication.php
 *
 * Middleware to control access to protected resources
 */
namespace App\Http\Middleware;

use Symfony\Component\HttpFoundation\Cookie; // To add a cookie to headers
use App\Factories\JWTFactory;
use App\Model\UserDAO;
use Illuminate\Http\Request;
use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Parser;
use Lcobucci\JWT\ValidationData;

use Closure;

/**
 * Authentication middleware for REST API
 */
class ApiAuthentication
{
    private $parser;
    private $signer;
    private $userDAO;
    private $JWTFactory;
    private $oldToken;

    public function __construct(
        Parser $parser,
        Sha256 $signer,
        UserDAO $userDAO,
        JWTFactory $JWTFactory
    ) {
        $this->parser = $parser;
        $this->signer = $signer;
        $this->userDAO = $userDAO;
        $this->JWTFactory = $JWTFactory;
    }
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next){
        // Recover the Authorization token
        $jwt = $_COOKIE['access_token'];
        // Parse JWT string into a new token object
        $this->oldToken = $this->parser->parse((string) $jwt);

        // Verifying token
        $isvalid = $this->verify();
        if (!$isvalid) {
            $this->returnBadTokenResponse();
        }

        $response = $next($request); // Call to next middleware

        // Recover userid in token
        $userid = $this->oldToken->getClaim("userid");
        $user = $this->userDAO->getById($userid);


        // Adding new JWT
        $token = $this->JWTFactory->getToken($user);

        return $response->cookie(
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

    /**
     * Verifies a JWT token
     *
     * @param string $jwt Encoded JWT string
     * @return boolean
     */
    private function verify(): bool {
        // Recovering secrets and parameters
        $issuer_url = $_ENV["APP_URL"];
        $jwt_secret = $_ENV["JWT_SECRET"];

        // Instantiating a ValidationData object
        $validationData = new ValidationData();
        $validationData->setIssuer($issuer_url);
        $validationData->setAudience($issuer_url);

        // Validate the parsed token against validation data
        $validated = $this->oldToken->validate($validationData);

        // Instantiate signer for signature verification
        //$signer = new Sha256();

        // Perform verification & return boolean value
        return ($validated && $this->oldToken
            ->verify($this->signer, $jwt_secret)
        );
    }

    private function returnBadTokenResponse(){
        $content = array("Error" => "Bad token");
        return response($content, 401);
            //->header("Content-type", "application/json");
    }
}
