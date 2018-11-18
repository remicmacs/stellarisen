<?php
/**
 * ApiAuthentication.php
 *
 * Middleware to control access to protected resources
 */
namespace App\Http\Middleware;
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

        // Verifying token
        $isvalid = $this->verify($jwt);
        if (!$isvalid) {
            $this->returnBadTokenResponse();
        }

        $response = $next($request); // Call to next middleware

        // @TODO
        // Adding new JWT

        return $response;
    }

    /**
     * Verifies a JWT token
     *
     * @param string $jwt Encoded JWT string
     * @return boolean
     */
    private function verify(string $jwt): bool {
        // Parse JWT string into a new token object
        $token = (new Parser())->parse((string) $jwt);

        // Recovering secrets and parameters
        $issuer_url = $_ENV["APP_URL"];
        $jwt_secret = $_ENV["JWT_SECRET"];

        // Instantiating a ValidationData object
        $validationData = new ValidationData();
        $validationData->setIssuer($issuer_url);
        $validationData->setAudience($issuer_url);

        // Validate the parsed token against validation data
        $validated = $token->validate($validationData);

        // Instantiate signer for signature verification
        $signer = new Sha256();

        // Perform verification & return boolean value
        return ($validated && $token->verify($signer, $jwt_secret));
    }

    private function returnBadTokenResponse(){
        $content = array("Error" => "Bad token");
        return response($content, 401)
            ->header("Content-type", "application/json");
    }
}
