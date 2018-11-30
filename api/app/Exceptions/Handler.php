<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Laravel\Lumen\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Exception\NoSuchUserException;
use App\Exception\NoSuchStarException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        AuthorizationException::class,
        HttpException::class,
        ModelNotFoundException::class,
        ValidationException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $exception
     * @return void
     */
    public function report(Exception $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $exception) {
        if ($exception instanceof \App\Exceptions\NoSuchUserException
            || $exception
                instanceof \App\Exceptions\AuthenticationFailureException
        ) {
            $message = $exception->getMessage();
            return response(array(
                "message" => $message
            ), 401)
                ->header('Content-type', 'application/json');
        } else if ($exception instanceof \App\Exceptions\NoSuchStarException) {
            $message = $exception->getMessage();
            return response(
                array(
                    "message" => $message
                ),
                404
            );
        } else {
            return response(
                array(
                    "message" => (get_class($exception))
                ),
                500
            );
        }
        return parent::render($request, $exception);
    }
}
