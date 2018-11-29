<?php

namespace App\Model;

use App\Model\DAO;
use App\Model\User;
use App\Model\CelestialBodyDAO;
/**
 * Repository object to access database information of users' favorites
 */
class FavoritesDAO implements DAO {
  private $celestialBodyDAO;
  public function __construct(CelestialBodyDAO $celestialBodyDAO) {
    $this->celestialBodyDAO = $celestialBodyDAO;
  }

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
    return app('db')->table('favorites')->where('id', $id)->first();
  }

  public function updateFavoritesList(User $user, $favorites) {
    $this->deleteUserFavs($user);
    $size = sizeof($favorites);
    $rows = array();
    for ($i = 0 ; $i < $size && $i < 10 ; $i++) {
      $currentFav = $favorites[$i];
      $celBody = $this->celestialBodyDAO->getByName($currentFav);
      $row = array(
        "userid" => $user->getUserid(),
        "celestial_bodies_id" => $celBody->getId(),
        "rank" => $i
      );
      array_push($rows, $row);
    }
    app('db')->table('favorites')->insert($rows);
  }

  private function deleteUserFavs(User $user) {
    app('db')->table('favorites')->where('userid', '=', $user->getUserid())->delete();

  }

}