<?php

namespace App\Model;

use App\Model\DAO;
use App\Model\User;
use App\Model\UserDAO;

/**
 * Repository object to access database information of users
 */
class FavoritesDAO implements DAO {
  public function insertFavorites(User $user, $favorites) {
  }

  public function getFavorites(User $user) {
    $rows = app('db')->table('favorites as f')
      ->join(
        "celestial_bodies as cb",
        "f.celestial_bodies_id",
        "=",
        "cb.id"
      )
      ->select("cb.name", "f.rank")
      ->get();

    $size = sizeof($rows->toArray());

    $favs = array_fill(0, $size, "");

    foreach($rows as $row) {
      $favs[$row->rank] = $row->name;
    }

    return $favs;
  }

  public function getById(string $id) {
    return $rows = app('db')->table('favorites')->where('id', $id)->first();
  }

}