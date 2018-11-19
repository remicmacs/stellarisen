<?php

namespace App\Http\Controllers;

use Laravel\Lumen\Routing\Controller as BaseController;

/**
 * Controller abstract class
 *
 * Attach the middleware "jsoncontent" to every Controller, so that any response
 * will be "Content-type:application/json"
 */
abstract class Controller extends BaseController
{
    public function __construct() {
        // Add Content-type : application/json header to every response
        $this->middleware('jsoncontent');
    }
}
