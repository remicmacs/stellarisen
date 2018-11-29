<?php
namespace App\Http\Controllers;

use App\Model\FavoritesDAO;
use App\Model\UserDAO;
use App\Model\User;
use Illuminate\Http\Request;

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

    public function setUserFavs(Request $request, string $username) {
        $user = $this->userDAO->getByUsername($username);

        $json = $request->json();

        $list = $json->all();
        $return = $this->favoritesDAO->updateFavoritesList($user, $list);
        // check return value
        $content = array(
            "newlist" => $list
        );
        return response($content);
    }
}
