<?php
/**
 * ApiAuthentication.php
 *
 * Middleware to control access to protected resources
 */
namespace App\Http\Middleware;

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
    public function handle($request, Closure $next)
    {
        //echo "Recieved request";
        //var_dump($request->content);
        return $next($request); // Call to next middleware
    }
}
