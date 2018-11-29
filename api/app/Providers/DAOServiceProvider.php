<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Http\Model\UserDAO;
use App\Http\Model\FavoritesDAO;
/**
 * Provides DAOs for every Model class existing.
 * Each DAO is a singleton using the sole database connection provided by
 * the framework
 */
class DAOServiceProvider extends ServiceProvider
{
  /**
   * Register a singleton UserDAO to access database table USERS
   *
   * @return void
   */
  public function register()
  {
    $this->app->singleton(UserDAO::class, function() {
      return new UserDAO();
    });
    $this->app->singleton(FavoritesDAO::class, function(){
      return new FavoritesDAO();
    });
  }
}