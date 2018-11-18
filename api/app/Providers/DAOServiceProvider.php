<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Http\Model\UserDAO;

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
  }
}