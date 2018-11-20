<?php

namespace App\Http\Middleware;

use Closure;
/**
 * Middleware just adding header "Content-type : application/json" to all
 * outgoing responses
 */
class ContentApplicationJSONMiddleware
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
        $response = $next($request); // Call to next middleware

        $response->header("Content-type", "application/json");

        return $response;
    }
}
