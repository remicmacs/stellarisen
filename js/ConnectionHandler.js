/**
 * Class to hold all state and methods for login process
 *
 * @class ConnectionHandler
 */
class ConnectionHandler extends FormSubmitHandler {
  constructor(formReference, toaster) {
    super();
    this.form = formReference;
    this.toaster = toaster;
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
    .then((res) => this.controlResponse(res))
    // Unpack JSON body
    //.then(res => res.json())
    // Handle all responses even 403 / 401 / 500s etc.
    // If code is not 200 => display information in red modal div
    // else make connection window disappear, display username in menu,
    //   and modify menu options to display leaderboards (and account management)
    .then((res) => this.afterAuth(res))

    // If this fails, it must be a network error and I frankly don't know what
    //   to do...
    .catch(error => {
      console.error("Fatal Error : ", error);
      console.debug(error);
    });
  }

  closer(element) {
    window.setTimeout(() => element.remove(), 2000);

  }

  controlResponse(response) {
    console.log(response);

    this.success = (response.status === 200);

    return response.json();
  }

  afterAuth(response) {
    if (this.success) {
      console.log('Authentication success:', JSON.stringify(response));
      return console.log("Return to menu");
    } else {
      return this.displayLoginError(response);
    }
  }

  displayLoginError(response) {
    // Recover form parent
    const parent = this.form.parentNode.parentNode;

    this.toaster.displayErrorToast(
      parent,
      response.authenticationError,
      "Login Error"
    );
  }

  handle(event){
    super.handle(event);
    this.connect();
  }
}