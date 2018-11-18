<?php

namespace App\Model;

class User {
  private $username;
  private $email;
  private $hash;

  public function getUsername() :string {
    return $this->username;
  }

  public function getEmail() :string {
    return $this->email;
  }

  public function getHash() :string {
    return $this->hash;
  }

  private function setUsername(string $username) {
    $this->username = $username;
  }

  private function setEmail(string $email) {
    $this->email = $email;
  }

  private function setHash(string $hash) {
    $this->hash = $hash;
  }
}