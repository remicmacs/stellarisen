<?php

namespace App\Model;

/**
 * Represent a Celestial body data
 */
class CelestialBody {
    private $name;
    private $type;
    private $id;

  // Getters
  public function getId() :int {
    return $this->id;
  }

  public function getName() :string {
    return $this->name;
  }

  public function getType() :string {
    return $this->type;
  }

  // Setters
  public function setName(string $name) {
    $this->name = $name;
  }

  public function setType(string $type) {
    $this->type = $type;
  }

  public function setId(int $id) {
    $this->id = $id;
  }
}