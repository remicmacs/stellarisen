<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\RegistrationController;

// Register route
$router->post('register', 'RegistrationController@register');

// Login route
$router->post('connect', 'ConnectionController@connect');

// Unprotected search API
$router->get('search/{query}', 'SearchController@publicSearch');

// Unprotected tag relation API
$router->get('search/tag/{tagname}', 'SearchController@publicTagSearch');

// Protected API routes
$router->group(
    [
        'middleware' => 'apiauth',
        'prefix' => 'connected/{username}'
    ],
    function() use ($router) {
        $router->get('/', function ($name) {
                $content = array("message" => "hello $username");
                return response($content, 200)
                    ->header("Content-type", "application/json");
            }
        );

        $router->get('favorites', 'FavoritesController@getUserFavs');
        $router->post('favorites', 'FavoritesController@setUserFavs');

        // Protected search API
        $router->get('search/{query}', 'SearchController@authenticatedSearch');

        // User specific tag relation API
        $router->get('search/tag/{tagname}', 'SearchController@userTagSearch');

        // Tag list retrieval API
        $router->get('tags/{starname}', 'TagController@starTags');
    }
);

$router->get('/', function () use ($router) {
    return $router->app->version();
});