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
class FavoritesController extends Controller
{
    public function getUserFavs(string $username) {
        return "Hello ". $username;
    }
}
