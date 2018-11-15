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
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;

/*
$router->get('hello/{name}',["apiauth", function($name) {
    $content = array("data" => "hello $name");
    $value = "application/json";
    return response()->json($content);
}]);
*/

$router->post('connect', function(Request $request) {
    $submitted_content = $request->content;
    $postContent = $_POST;
    $username = $_POST['username'];
    $password = $_POST['password'];

    if ($username !== "remicmacs" || $password !== "prout") {
        return response(array("error", "Unauthorized user"), 403);
    }
    $content = array("token" => "hello");
    $value = "application/json";
    //Cookie::queue('token', 'jesuisconnectesisijevousjure', 60);
    return response($content)->withCookie(new Cookie('token', 'jesuisconnectesisijevousjure', 60));
});

$router->get('/', function () use ($router) {
    return $router->app->version();
});