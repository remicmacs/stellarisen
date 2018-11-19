<?php

namespace App\Factories;

use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use App\Model\User;

/**
 * Factory of Javascript Web Tokens
 */
class JWTFactory {
  private $JWTSecret;
  private $builder;
  private $signer;

  /**
   * Constructor of JWTFactory
   *
   * Injects Builder and Signer objects necessary to create a token
   *
   * @param Builder $builder
   * @param Sha256 $signer
   */
  public function __construct(Builder $builder, Sha256 $signer) {
    $this->JWTSecret = $_ENV["JWT_SECRET"];
    $this->builder = $builder;
    $this->signer = $signer;
  }

  /**
   * Manage JWT (Javascript Web Token) creation
   *
   * To create a token as unique as possible, we hash the username concatenated
   * with a timestam.
   *
   * @param User $user User object for whom whe create a JWT
   * @return string the token stringified, ready to be loaded in Cookie
   */
  public function getToken(User $user) :string {
    // Trying to make jti as unique as possible
    $jti_claim = hash("sha256", $user->getUsername().(time()));
    $token = $this->builder
        // jti claim = unique id that will not have hash collision with
        //    another generated JWT
        ->setId($jti_claim, true)
        // iat claim = timestamp when the JWT has been generated
        ->setIssuedAt(time())
        // nbf claim = timestamp of the beginning of the JWT validity period
        ->setNotBefore(time() + 1)
        // exp claim = timestamp for expiration time
        ->setExpiration(time() + 3600)
        // Set uid to avoid to recover uid every time in database
        // recover userid from user object
        ->set('userid', $user->getUserId())
        // Signing the JWT
        ->sign($this->signer, $this->JWTSecret)
        // Retrieves the generated token
        ->getToken();

    // Forcing token to be in string value
    // __tostring method of Token encodes in base64 and concatenates
    // every three part of JWT (headers.claims.signature)
    $token = (string) $token;

    return $token;
  }
}