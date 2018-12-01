<?php

namespace App\Http\Controllers;

use App\Model\UserDAO;
use App\Model\User;

/**
 * Class to fetch tag lists
 */
class TagController extends Controller {
  private $userDAO;

  public function __construct(UserDAO $userDAO) {
    $this->userDAO = $userDAO;
  }

  /**
   * Recovers a list of tag associated to the user and the celestial body
   *
   * @param string $username
   * @param string $starname
   * @return void
   */
  public function starTags(string $username, string $starname) {
    // @TODO: Check if star exists ? Returns an empty array which is handled anyway.
    $user = $this->userDAO->getByUsername($username);

    $rows = app('db')
    ->table('celestial_bodies')
    ->innerJoin('tags', 'tags.celestial_bodies_id', '=', 'celestial_bodies.id')
    ->innerJoin('labels', 'tags.label_id', '=', 'labels.label_id')
    ->select('labels.name')
    ->where('tags.userid', '=', $user->getUserId())
    ->where('celestial_bodies', '=', $starname)
    ->orderBy('name')
    ->get();

    $rows = $rows->toArray();
    return response($rows, 200);
  }
}