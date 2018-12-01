<?php

namespace App\Http\Controllers;

use App\Model\UserDAO;
use App\Model\CelestialBodyDAO;
use App\Model\User;
use App\Model\CelestialBody;

class TagController extends Controller {
  private $userDAO;
  private $celestialBodyDAO;

  public function __construct(
    UserDAO $userDAO,
    CelestialBodyDAO $celestialBodyDAO
  ) {
    $this->userDAO = $userDAO;
    $this->celestialBodyDAO = $celestialBodyDAO;
  }

  public function publicTag(string $tagname) {
    $rows = $this->publicResults($tagname);

    return response($rows, 200);
  }

  public function userTag(string $username, string $tagname) {
    $publicRows = $this->publicResults($tagname);
    return response($publicRows, 200);
  }

  private function publicResults(string $tagname) {
    $rows = app('db')
      ->table('celestial_bodies')
      ->select('name', 'type')
      ->where('type', 'like', "%$tagname%")
      ->orderBy('name')
      ->get();
    $rows = $rows->toArray();
    return $rows;
  }
}