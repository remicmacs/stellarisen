/**
 * Class to hold all state and methods for login process
 *
 * @class ConnectionHandler
 */
class ConnectionHandler extends FormSubmitHandler {
  constructor(formReference) {
    super();
    this.form = formReference;
  }

  /**
   * Event handler for connection form
   *
   * Triggered on `submit` event.
   *
   * Intercept normal event behaviour and connects the user with AJAX requests
   *
   * @param {*} event
   * @memberof ConnectionHandler
   */
  connect() {
    fetch(this.url, {
      method: 'POST',
      body: this.data,
    })
    // Unpack JSON body
    .then(res => res.json())

    // Handle all responses even 403 / 401 / 500s etc.
    // If code is not 200 => display information in red modal div
    // else make connection window disappear, display username in menu,
    //   and modify menu options to display leaderboards (and account management)
    .then(response => {
        console.log('Authentication success:', JSON.stringify(response));
      }
    )

    // If this fails, it must be a network error and I frankly don't know what
    //   to do...
    .catch(error => {
      console.error("Fatal Error : ", error);
      console.debug(error);
    });
  }

  handle(event){
    super.handle(event);
    this.connect();
  }
}