<?php

namespace App\Model;

use App\Model\DAO;
use App\Model\CelestialBody;
/**
 * Repository object to access database information of users' favorites
 */
class CelestialBodyDAO implements DAO {

  public function getById(string $id) {
    return app('db')->table('celestial_bodies')->where('id', $id)->first();
  }

  public function getByName(string $name): CelestialBody {
    $row = app('db')->table('celestial_bodies')->where('name', $name)->first();
    $celBody = new CelestialBody();
    $celBody->setName($row->name);
    $celBody->setId($row->id);
    $celBody->setType($row->type);

    return $celBody;
  }
}