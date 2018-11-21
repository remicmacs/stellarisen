<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Lcobucci\JWT\Builder;

/**
 * Provides a Builder to any class needing it
 */
class JWTBuilderProvider extends ServiceProvider
{
  public function register()
  {
    $this->app->bind(Builder::class, function() {
      $issuer_url = $_ENV['APP_URL'];
      return (new Builder())
        ->setIssuer($issuer_url)
        // aud claim = target audience for the token
        ->setAudience($issuer_url)
        // iat claim = timestamp when the JWT has been generated
        ->setIssuedAt(time())
        // nbf claim = timestamp of the beginning of the JWT validity period
        ->setNotBefore(time() + 1)
        // exp claim = timestamp for expiration time
        ->setExpiration(time() + 3600);
    });
  }
}