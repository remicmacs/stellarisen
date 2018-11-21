<?php

namespace App\Model;

/**
 * Represent the application User's data
 */
class User {
  private $username;
  private $hash;
  private $userId;

  // Getters
  public function getUserId() :int {
    return $this->userId;
  }

  public function getUsername() :string {
    return $this->username;
  }

  public function getHash() :string {
    return $this->hash;
  }

  // Setters
  public function setUsername(string $username) {
    $this->username = $username;
  }

  public function setHash(string $hash) {
    $this->hash = $hash;
  }

  public function setUserId(int $userId) {
    $this->userId = $userId;
  }
}