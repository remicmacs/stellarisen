<?php

namespace App\Model;

use App\Model\User;
use App\Model\CelestialBodyDAO;

/**
 * Repository object to access database information of users' favorites
 *
 * No compliance to DAO interface because no favorites class model is
 * implemented as arrays are already suited as a datastructure to reprensent an
 * ordered list of string values.
 *
 * Updating the list of favorites is done by deleting the old one to simplify
 * the requests. Not so big overhead in ressources as deleting and inserting is
 * made in bulk, but code clarity clearly is improved.
 */
class FavoritesDAO {
  private $celestialBodyDAO;

  /**
   * Constructor with dependancy injection on CelestialBodyDAO
   *
   * @param CelestialBodyDAO $celestialBodyDAO
   */
  public function __construct(CelestialBodyDAO $celestialBodyDAO) {
    $this->celestialBodyDAO = $celestialBodyDAO;
  }

  /**
   * Get the list of favorites stars of a user.
   *
   * @param User $user User object representing the account for which data
   *  retrieval is done.
   * @return array Ordred list of favorites stars
   */
  public function getFavorites(User $user) :array {
    $rows = app('db')->table('favorites as f')
      ->join(
        "celestial_bodies as cb",
        "f.celestial_bodies_id",
        "=",
        "cb.id"
      )
      ->where("f.userid", "=", $user->getUserId())
      ->select("cb.name", "f.rank")
      ->get();

    // Instantiating an array of just the right size
    $size = sizeof($rows->toArray());
    $favs = array_fill(0, $size, "");

    /*
     * Ordering the array according to the "rank" field.
     * We could sort inside the SQL query but to be sure we would reorder it
     * anyway, so it's just as good to do it only in PHP.
     */
    foreach($rows as $row) {
      $favs[$row->rank] = $row->name;
    }

    return $favs;
  }

  /**
   * Saves new list of favorites to the database.
   *
   * @param User $user
   * @param array $favorites
   * @return void
   */
  public function updateFavoritesList(User $user, array $favorites) {
    // Creating array of rows of values to bulk insert
    $rows = array();

    $size = sizeof($favorites);
    for ($i = 0 ; $i < $size && $i < 10 ; $i++) {
      $currentFav = $favorites[$i];
      $celBody = $this->celestialBodyDAO->getByName($currentFav);
      if ($celBody !== null) {
        $row = array(
          "userid" => $user->getUserid(),
          "celestial_bodies_id" => $celBody->getId(),
          "rank" => $i
        );

        // Putting new 3-uple inside list of rows to insert.
        array_push($rows, $row);
      }
    }

    $this->deleteUserFavs($user);
    // Bulk insert all rows
    app('db')->table('favorites')->insert($rows);
  }

  /**
   * Deletes current list of favorites before inserting the reordered one.
   *
   * @param User $user
   * @return void
   */
  private function deleteUserFavs(User $user) {
    app('db')
      ->table('favorites')
      ->where('userid', '=', $user->getUserid())
      ->delete();

  }

}