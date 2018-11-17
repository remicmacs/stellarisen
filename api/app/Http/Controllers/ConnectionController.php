<?php

namespace App\Http\Controllers;

// To be able to create cookies to attach to response
use Symfony\Component\HttpFoundation\Cookie;

class ConnectionController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @TODO: dependancy injection on UserRepository object
     *
     * @return void
     */
    public function __construct()
    {
        // Nothing to do yet
        // Maybe DI of Repository object
    }

    /**
     * Login handler for AJAJ connection
     *
     * @return Illuminate\Http\Response
     */
    public function connect() {
        // Sometimes, $_POST is unset, if not accessed by the proper means
        $username = filter_input(INPUT_POST, 'username');
        $password = filter_input(INPUT_POST, 'password');

        // If any of the vars is null, it means it was not set in $_POST
        // superglobal variable upon receiving request.
        if ($username === null || $password === null
            || $username !== "remicmacs" || $password !== "prout"
        ) {
            // User credentials verification should take place here

            // Add a message to display in modal window
            return response(array("error", "Authentication failure"), 401)
                ->header("Content-type", "application/json");
        }

        // Manage JWT (Javascript Web Token) creation
        $content = array("token" => "hello");
        $value = "application/json";
        return response($content)
            ->header("Content-type", "application/json")
            // Is the cookie necessary ?
            ->cookie(new Cookie('token', 'jesuisconnectesisijevousjure', 60));
    }
}
