<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Factories\JWTFactory;
use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;

/**
 * Provides a JWTFactory singleton to the whole app.
 *
 * The JWTFactory will produce JWTs for authenticated requests
 */
class JWTFactoryProvider extends ServiceProvider
{
  public function register()
  {
    $this->app->singleton(
      JWTFactory::class,
      function () {
        return new JWTFactory(new Builder(), new Sha256());
      }
    );
  }
}