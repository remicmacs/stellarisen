/**
 * Class to hold every needed state and handlers for the registration process.
 *
 * @class RegistrationHandler
 * @extends {FormSubmitHandler}
 */
class RegistrationHandler extends FormSubmitHandler{
  constructor(formReference) {
    super();
    this.form = formReference;
  }

  handle(event) {
    super.handle(event);

    // Recovering every field of the form
    const otherdata = {};
    for (const pair of new FormData(event.target)) {
      otherdata[pair[0]] = pair[1];
    }

    const validpassword = this.validatePassword(otherdata);

    // Send register request only if password is correct in both fields
    return validpassword && this.register();
  }

  /**
   * Client-side validation of password confirmation field
   *
   * @param {Object} data Dictionnary of all input values in form
   * @returns boolean value
   * @memberof RegistrationHandler
   */
  validatePassword(data) {
    if (data.password !== data.repassword) {
      // @TODO
      // Display error "Passwords must match"
      console.error("Password must match to be sent");
      return false;
    }
    return true;
  }

  /**
   * Send a user register request to the API
   *
   * @memberof RegistrationHandler
   */
  register() {
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
    .then(this.handleRegistrationResponse)

    // If this fails, it must be a network error and I frankly don't know what
    //   to do...
    .catch(error => {
      console.error("Fatal Error : ", error);
      console.debug(error);
    });
  }

  /**
   * Handle normal registration responses
   *
   * @TODO:
   *  - Handle 200 : success
   *  - Handle 500 : server error
   *  - Handle 404 : server unavailable on this network
   * 401 & 403 should not occur as anyone can register.
   *
   * @param {*} response
   * @memberof RegistrationHandler
   */
  handleRegistrationResponse(response) {
    console.log('Registration success:', JSON.stringify(response));
  }
}