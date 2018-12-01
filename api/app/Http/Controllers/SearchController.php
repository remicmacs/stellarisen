<?php

namespace App\Http\Controllers;

use App\Model\UserDAO;
use App\Model\CelestialBodyDAO;
use App\Model\User;
use App\Model\CelestialBody;

class SearchController extends Controller {
  private $userDAO;
  private $celestialBodyDAO;

  public function __construct(
    UserDAO $userDAO,
    CelestialBodyDAO $celestialBodyDAO
  ) {
    $this->userDAO = $userDAO;
    $this->celestialBodyDAO = $celestialBodyDAO;
  }

  public function publicSearch(string $query) {
    $rows = $this->publicResults($query);

    return response($rows, 200);
  }

  public function authenticatedSearch(string $username, string $query) {
    $publicRows = $this->publicResults($query);
    return response($publicRows, 200);
  }

  private function publicResults(string $query) {
    $rows = app('db')
      ->table('celestial_bodies')
      ->select('name', 'type')
      ->where('name', 'like', "%$query%")
      ->orwhere('type', 'like', "%$query%")
      ->get();
    $rows = $rows->toArray();
    return $rows;
  }
}