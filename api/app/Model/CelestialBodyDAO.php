<?php

namespace App\Model;

use App\Model\DAO;
use App\Model\CelestialBody;
use App\Exceptions\NoSuchStarException;

/**
 * Repository object to access Celestial bodies information.
 *
 * CelestiaBody object mostly host their database ids that are not available
 * client-side.
 */
class CelestialBodyDAO implements DAO {

  public function getById(string $id) {
    return app('db')->table('celestial_bodies')->where('id', $id)->first();
  }

  public function getByName(string $name): CelestialBody {
    $row = app('db')->table('celestial_bodies')->where('name', $name)->first();
    if ($row === null) throw new NoSuchStarException(
      "L'astre '".$name."' n'existe pas."
    );
    $celBody = new CelestialBody();
    $celBody->setName($row->name);
    $celBody->setId($row->id);
    $celBody->setType($row->type);

    return $celBody;
  }
}