<?php

namespace App\Model;

class User {
  private $username;
  private $hash;
  private $userId;

  public function getUserId() :int {
    return $this->userId;
  }

  public function getUsername() :string {
    return $this->username;
  }

  public function getHash() :string {
    return $this->hash;
  }

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