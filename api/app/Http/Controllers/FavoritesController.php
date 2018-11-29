<?php
namespace App\Http\Controllers;

use App\Model\FavoritesDao;

/**
 * ConnectionController
 *
 * Controller for authentication process
 */
class FavoritesController extends Controller
{
    private $favoritesDAO;

    public function __construct(FavoritesDAO $favoritesDAO) {
        $this->favoritesDAO = $favoritesDAO;
    }

    public function getUserFavs(string $username) {
        return "Hello ". $username;
    }
}
