<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Lcobucci\JWT\Signer\Hmac\Sha256;

/**
 * Provides a Sha256 signer instance to any class needing it
 */
class JWTSignerProvider extends ServiceProvider
{
  public function register()
  {
    $this->app->bind(
      Signer::class,
      function () {
        return new Sha256();
      }
    );
  }
}