# API

The backend server for this project is a REST HTTP API implemented in PHP7 thanks to the framework provided by [the Lumen micro-framework](http://lumen.laravel.com).

## REST API Design
### CRUDs in REST API
[REST stands for " **Re**presentational **S**tate **T**ransfer "](https://en.wikipedia.org/wiki/Representational_state_transfer). It is a common type of software architecture for providing services to clients. It is widely used nowadays, replacing the ageing and more complex **SOAP** architecture.

A client communicates with the REST API via HTTP requests and responses.

HTTP methods are used as action verbs to perform on ressources designated by URIs. A fuzzy mapping can be made between HTTP methods and CRUD operation.

* Create -> PUT
* Read -> GET
* Update -> POST
* Delete -> DELETE

This mapping should not be considered as a strict correspondance rather than an indication of what can be done using HTTP as a messaging protocol to transport data between the client and the server.

### Main constraints of REST
As an architectural guideline, REST comes with a set of constraints we tried to
enforce when possible. The main constraints are the following :

* Client-server architecture
* Statelessness : the API does not take care of a session state. Each request should have all the information required for the API to be able to respond to it.
* Cacheability : reponses should indicate, when possible whether the communicated resource is cacheable, in order to limit as much as possible requests to the API.
* Layered system : the client should not be able to know (or need to know) whether the API it is communicating with is the original source of truth or a middleman.
* Uniform interface : having the identifier of the resource (the URI in a RESTful web service), the client should be able to know how to modify or delete this resource. It also means that the metadata should be suficient to access the rest of the resources available, e.g. a request could ask for all articles, and the API responding only with the 100 first articles to limit the payload of one request. If the API makes this choice, it should provide a new URI to fetch the following articles.

These constraints obliged us to learn about REST, and to implement unfamiliar pattern. However, this drawback is widely compensated by not having to design yet another API architecture. When a dilemma arises, it is only necessary to look it up online and to find dozens of articles helping the developer to make a choice.


### Stateless API
The main challenge to provide a stateless API, is to process all protected requests. If there is no session data, then there is no possiblity to stay connected to the API.

A limited set of solutions exist :

* OAuth 1 & 2 : authentication standard which outsources the responsability to identify a user. A user asks for a **token** to another server, and request access to resources with it. The API asks the token provider if it is a valid token, and grants access based on its response.
* Basic Auth : simple concatenation of username and password encoded in a Base64 string.
* [JWT (JSON Web Token)](https://developer.atlassian.com/cloud/jira/service-desk/understanding-jwt/) : Encoded JSON object holding varied values, such as the domain on which it can be used, the expiration date, etc. Each JWT is **cryptographically signed** based on a secret stored on the server.

OAuth was not a realistic solution for us, as it often implies to suscribe to an external provider. As it is necessary to have a public IP address and domain name to register, it was not convenient for our development workflow, even if it would have been a good introduction to an industry standard.

Basic Auth, on the other hand, is sending username and password almost unencrypted with every request asking for a protected resource.

JWT is not very different than a session ID stored in a cookie : of course it is easily stolen and can be used to impersonate the user, but the password is exposed only on the first request. 

#### JWT implementation
TODO: SCHEMA

To make the JWT pattern less insecure, we renew the JWT on every request on a protected resource. Every token is generated using the current timestamp, making forging of a valid JWT almost impossible. The expiration time is set to one hour after issuance.

The downside is that a lot more valid JWTs are circulating at the same time.

The upside is that an attacker will have a lot more difficulties to find a pattern if the token is always different. And used JWTs can be stored in database to be marked as consumed with only a slight overhead (future feature ??).

To implement the JWT issuing logic, we used the [lcobucci\jwt](https://github.com/lcobucci/jwt) Composer package. It provides a HMAC, RSA and ECDSA signing.

Every time a request reaches an endpoint to a protected resource, a middleware intercepts the request, validates it. If the JWT is valid, the request then proceed as if the request was not on a protected resource, and when the API sends a response, the middleware attaches it a newly issued JWT in a cookie.

##### Client-side JWT handling
The client has absolutely nothing to do to ensure the JWT is passed along with the next request.

Browsers usely prohibit single page applications to access cookies returned in an AJAX response, as a defense mecanism against security breaches. However, the browser handles the responsability to attach every cookie issued by the server with the previous request.

Thus, the JWT is hardly reachable by malicious client-side code, and is guaranteed to always be provided with the requests following the authentication.

#### HTTPS
With HTTPS, the current JWT implementation is made way more robust as all communication is encrypted with asymmetric keys, which is much harder to break.
The JWT middleware is HTTPS-ready because a simple flag has to be activated to add a header accepting only JWTs over HTTPS and not HTTP.

## Micro-Framework Lumen
The Lumen micro-framework is based on the widely used [Laravel](http://laravel.com/) framework, widely used and documented. Laravel has an associated website providing documentation, tutorials, guides and forums for its community. It is really loved and benefits from a vibrant community, and indirectly, so does Lumen.

This framework is highly opinionated and handles common problems with patterns necessitating a bit of habituation.

### Routes
As many frameworks, Lumen intercepts all requests extending a root URI. In our case, the API is available from `<Domain>/api/public`.

The routes are defined in a declarative manner in the `/api/routes/web.php` file : 

```php
$router->get('search/{query}', 'SearchController@publicSearch');
```

In this example, a `search/` route is defined under the server root. Associating the server root and the declared route, we can say that the URL `<domain>/api/public/search/` is a valid endpoint of the API. All requests of this route will be handled  by the  `publicSearch` method of the `SearchController` class (see below the [section Controllers](#Controllers)).

The `/{query}` syntax declares a fraction of the URI as a variable value, which will be passed as a string parameter to the `publicSearch` method.

Routes can also be declared in bulk, with multiple possible methods, associated with multiple middlewares, etc. A request with a URL failing to match any declared route will be responded with a 404 error status code.

### Controllers
Controllers are objects handling the **business logic** of the application. It is a common object in OOP (e.g. in the MVC architecture). Each controller is provided with every needed dependency. It means that every controller works in isolation from other controllers, handling a specific category of requests 

### Middleware
TODO : Schema

A middleware is a piece of software acting as a filter. A middleware is often used as a layer between a client process and a service prodider.

In Laravel and Lumen, middleware is a heavily used design pattern. It is because web communication between client and server is really suited to this kind of software design.

When a request reaches the server, it goes down through an ordered stack of middlewares, unpacking data, filtering elements, and sometimes providing immediate responses to specific cases.

The server then processes the request in a generic way, without bothering with data filtering, edge cases and so on.

Then a response is emitted and goes up another stack of middlewares, binding specific informations to the response, like headers, cookies, metadata, etc, etc.

Middlewares enable the developer to write controllers handling **only business logic** and not edge cases logistics. The core functionalities benefits from the middleware design pattern by being much more legible.

In Lumen, middlewares are attached to route declarations :

```php
// Protected API routes
$router->group(
    [
        'middleware' => 'apiauth',
        'prefix' => 'connected/{username}'
    ],
    function() use ($router) {
        $router->get('favorites', 'FavoritesController@getUserFavs');
        $router->post('favorites', 'FavoritesController@setUserFavs');
        ...
    }
);
```
Above is an example of a group of routes under the prefix `connected/` being served with a middleware.

The `apiauth` middleware ensures every incoming request provides a JWT (see above) 

The `apiauth` middleware is somewhat special because it intervenes **both** on the request **and** the response : the request's JWT is tested on arrival and a new JWT is instantiated and attached in a cookie.

Another middleware is used on all routes of the application and handles binding a `Content-type: application/json` header to every outgoing response, for the client's browser to know the format of the data received.

### Dependency injection
DI is a common OOP design pattern stating that dependancies of objects (services) should be explicitely injected in the object needing them (client), rather than being instantiated every time they are needed.

Lumen comes with a strongly opinionated pattern using **services containers** and an application-level **service provider** to handle dependancy injection.

It is a widely complex and powerful features, and we could not grasp all of its nuances. But it works broadly in this way :

* A **service** is packaged in a **service container**, with all the logic needed to be properly instantiated in a valid state. The service container defines is a service class should be instantiated every time (bind), a singleton, or a static class ;
* The service is then **registered** and declared to the **service provider** ;
* Any other business logic classes - and mainly, controllers - declare their dependancies as parameters of their constructors (or their public methods).
* When theses classes are needed, the Application object uses its service providers to pass needed dependancies to the classes.

This design pattern is the reason why no instantiation of the controllers is ever done by our own code : the framework and the Application instance ensure that the dependancy injection is done according this specific process.


Below is the code registering the services providers available to the Application object in the `api/bootstrap/app.php` file :

```php
// Registering DAO Provider : enables one singleton DAO to be delivered to classes needing it
$app->register(App\Providers\DAOServiceProvider::class);

// Registering provider for JWT things
$app->register(App\Providers\JWTBuilderProvider::class);
$app->register(App\Providers\JWTSignerProvider::class);
$app->register(App\Providers\JWTFactoryProvider::class);
```

### Exception Handler

As for Dependancy injection, exceptions are managed in a specific way in Lumen and Laravel. Every exception not caught in the body of the function triggering it will be caught by the Exception Handler of the application.

Custom Exceptions are registered by being tested and handled in one of the methods of the `App\Exceptions\Handler.php` class. Exceptions will be rendered (logged or displayed) or reported according the used method.

### Pros and cons
Using a framework is almost always regretting not using another. Each these tools have its ways of doing things and is thus best suited to different developers.

Having a preference is not a bad thing, but one should be aware of the pros and cons of the tools one uses.

#### Pros
* Massive community
* A lot of maintainers
* Industry-grade quality
* Lightweight (none of the templating engine of the full Laravel framework)

#### Cons
* Apparent huge documentation with Laravel, in practice a lot of inconsistencies between Lumen and Laravel, and absolutely **no link whatsoever** directing to the API documentation of the cited classes. Every name like `Illuminate\Database\QueryBuilder` is highlighted, **but provides no link to the proper documentation of the class*. So every class has to be googled.
* Highly opinionated on service containers / providers, being hard to understand for beginners.
* Most examples of the documentation are simplistics and do not provide enough insight on how to proceed in complex situations.

## Database and model
### MySQL / MariaDB
We used the MariaDB database, which is a free and open source database, being "99,999 % compatible" with MySQL. MariaDB gained in popularity when Oracle bought and changed the software license of MySQL, making it highly suspicious for a lot of Linux users. Many Linux distributions install MariaDB instead of MySQL, even if the package is still called `mysql`. Notably, Debian Linux tries to keep any non-free software out of the core repositories of the distro, and made the change really quickly.

The differences are only marginal, and both use the same databases engines, syntax, and configurations.

#### Database creation
The deployment script `deploy_inside.sh` uses the CLI `mysql` to run a SQL script to create a database `stellarisen` for the application, a user only able to use this database. This scripts prompts the user for a password, and inserts it in the `/api/.env` file for the application to use.

This choice has been made to avoid storing credentials on a public Git repository, and to ensure a user has to choose a custom password for a new database (see the `database_scripts/create_user_and_db.sql` script). That way, no default password is used and documented.

The script then uses the new user to create tables and inserting initial values (see the `database_scripts/create_tables.sql` script).

The tables created are :

* `users` for authentication process and relations to personal data ;
* `celestial_bodies` as a reference to various space objects that the web application displays. We did not used a specific table for each type of object, nor did we store more data than the name and types of the objects. As we already had all this information in a JSON file that was fully loaded at startup, we did not want to duplicated the information, and add load on the database operation even though all static data was already loaded client-side for the 3D scenes instantiation.
* `favorites` : linking a user, a celestial body and a rank.
* `labels` : storing text labels of tags
* `tags` : linking users, celestial bodies, and labels

Constraints of uniqueness are specified when needed : the rank of a favorite must be unique for a user, and a celestial body can be only favorited once ; a tag label must be associated only once with the same user and celestial body, etc.

### Laravel Query Builder
Lumen provides an interface to abstract the use of PDO. Instantiation is handled for the developer, and every part of the SQL syntax has its own method :

```php
$row = app('db')->table('celestial_bodies')->where('name', $name)->first();
```

Above is a snippet selecting the first result of a SQL query like :

```sql
SELECT * FROM TABLE `celestial_bodies` WHERE `name` = ?
```
with ? as a parameter placeholder waiting for PDO binding.

This interface is really useful and simple to work with, however, it reaches its limits with complex queries, like this one :

```php
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
```

This query is inserted as raw text because aggregation functions as `COUNT` are poorly handled by the Laravel QueryBuilder. The QueryBuilder is incapable of ordering by a column not included in the `select` method, and the `select` method won't take `count(*) as columname` as an argument.

In this situation we used a classic prepared statement with parameters placeholders (`?`s), and parameter binding.

So even if the QueryBuilder cannot do this kind of operation, it is transparent as it provides at least the same functionality as PDO.