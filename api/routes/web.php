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

$router->group(['middleware' => 'apiauth'], function() use ($router) {
    $router->get('connected/{name}', function ($name) {
        $content = array("message" => "hello $name");
        return response($content, 200)
            ->header("Content-type", "application/json");
    });

    $router->get('favorites/{username}', 'FavoritesController@getUserFavs');
});

$router->get('/', function () use ($router) {
    return $router->app->version();
});