<?php
namespace App\Http\Controllers;

use App\Model\FavoritesDAO;
use App\Model\UserDAO;
use App\Model\User;
use Illuminate\Http\Request;

/**
 * FavoritesController
 *
 * Controller retrieving and saving favorites of authenticated user
 */
class FavoritesController extends Controller
{
    private $favoritesDAO;
    private $userDAO;

    /**
     * Constructor with dependancy injection on needed DAOs
     *
     * @param FavoritesDAO $favoritesDAO
     * @param UserDAO $userDAO
     */
    public function __construct(FavoritesDAO $favoritesDAO, UserDAO $userDAO) {
        $this->favoritesDAO = $favoritesDAO;
        $this->userDAO = $userDAO;
    }


    /**
     * Gets the list of favorites associated with the user
     *
     * @param string $username Username of current user
     * @return array ordered list of the user's favorites or empty array if no
     *  favorites are saved already.
     */
    public function getUserFavs(string $username): array {
        $user = $this->userDAO->getByUsername($username);
        $favs = $this->favoritesDAO->getFavorites($user);
        return $favs;
    }

    /**
     * Saves the list of user's favorites all at once
     *
     * @param Request $request
     * @param string $username
     * @return void
     */
    public function setUserFavs(Request $request, string $username) {
        $user = $this->userDAO->getByUsername($username);

        $json = $request->json();

        $list = $json->all();
        $return = $this->favoritesDAO->updateFavoritesList($user, $list);
        // @TODO: check return value

        $content = array("newlist" => $list);
        return response($content);
    }
}
