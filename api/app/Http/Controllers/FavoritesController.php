<?php
namespace App\Http\Controllers;

use App\Model\FavoritesDAO;
use App\Model\UserDAO;
use App\Model\User;

/**
 * ConnectionController
 *
 * Controller for authentication process
 */
class FavoritesController extends Controller
{
    private $favoritesDAO;
    private $userDAO;

    public function __construct(FavoritesDAO $favoritesDAO, UserDAO $userDAO) {
        $this->favoritesDAO = $favoritesDAO;
        $this->userDAO = $userDAO;
    }

    public function getUserFavs(string $username) {
        $user = $this->userDAO->getByUsername($username);
        $favs = $this->favoritesDAO->getFavorites($user);
        return $favs;

    }
}
