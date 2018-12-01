<?php

namespace App\Http\Controllers;

use App\Model\UserDAO;
use App\Model\User;
/**
 * Controller for search queries
 */
class SearchController extends Controller {
  private $userDAO;

  /**
   * Constructor with UserDAO injection
   *
   * @param UserDAO $userDAO
   */
  public function __construct(UserDAO $userDAO) {
    $this->userDAO = $userDAO;
  }

  /**
   * Entry point for a non authenticated search query.
   *
   * When the user is anonymous, the search query will only look up the name of
   * the stars.
   *
   * @param string $query
   */
  public function publicSearch(string $query) {
    $rows = app('db')
      ->table('celestial_bodies')
      ->select('name', 'type')
      ->where('name', 'like', "%$query%")
      ->orderBy('name')
      ->get();

    // Convert $rows from Custom Symfony collection to plain old array
    $rows = $rows->toArray();

    return response($rows, 200);
  }

  /**
   * Entry point for authenticated search queries.
   *
   * This method returns the same results as the public search query API
   * endpoint, and then some. All additional results are from user-defined
   * tags. The results are ordered by a score (number of matches), and then
   * by lexicographical order.
   *
   * @param string $username string representing the user. Should be right if
   *  the user has already a JWT
   * @param string $query
   * @return void
   */
  public function authenticatedSearch(string $username, string $query) {
    // Recovering user object
    $user = $this->userDAO->getByUsername($username);

    // Building wildcard string to work with "like" MySQL operator
    $query = "%".$query."%";

    // Raw query because the QueryBuilder is too dumb for count() MySQL function
    $rows = app('db')->select(
      'select cb.name, cb.type
      from celestial_bodies cb
        left join tags t on t.celestial_bodies_id = cb.id
        left join labels l on l.label_id = t.label_id
      where cb.name like ? or t.userid = ? and l.name like ?
      group by cb.name, cb.type
      order by count(cb.name) desc, cb.name',
      // Parameter binding in order of the raw ? in the query string.
      [
        $query,
        $user->getUserid(),
        $query
      ]
    );
    return response($rows, 200);
  }

  /**
   * Entry point for public search queries by exact name of celestial body type.
   *
   * @param string $tagname
   * @return void
   */
  public function publicTagSearch(string $tagname) {
    $rows = app('db')
    ->table('celestial_bodies')
    ->select('name', 'type')
    ->where('type', '=', "$tagname")
    ->orderBy('name')
    ->get();

    $rows = $rows->toArray();
    return response($rows, 200);
  }

  /**
   * Entry point for authenticated search queries by exact match on tag label.
   *
   * @param string $username
   * @param string $tagname
   * @return void
   */
  public function userTagSearch(string $username, string $tagname) {
    $user = $this->userDAO->getByUsername($username);

    $rows = app('db')
      ->table('celestial_bodies')
      ->innerJoin('tags', 'tags.celestial_bodies_id', '=', 'celestial_bodies.id')
      ->innerJoin('labels', 'tags.label_id', '=', 'labels.label_id')
      ->select('celestial_bodies.name', 'celestial_bodies.type')
      ->where('tags.userid', '=', $user->getUserId())
      ->where('labels.name', '=', $tagname)
      ->orderBy('name')
      ->get();

    $rows = $rows->toArray();
    return response($rows, 200);
  }
}