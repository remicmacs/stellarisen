/**
 * Class to hold all state and methods for login process
 *
 * @class ConnectionHandler
 */
class ConnectionHandler {

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
  connect(event) {
    event.preventDefault();
    // Recovering form data
    const data = new FormData(event.target);

    /*
    // Debug
    const otherdata = {};
    for (const pair of new FormData(event.target)) {
      otherdata[pair[0]] = pair[1];
    }
    console.log(otherdata);
    */

    // Recovering target URL
    const url = event.target.action;
    fetch(url, {
      method: 'POST',
      body: data,
    })
    // Unpack JSON body
    .then(res => res.json())
    // Handle all responses even 403 / 401 / 500s etc.
    // If code is not 200 => display information in red modal div
    // else make connection window disappear, display username in menu,
    //   and modify menu options to display leaderboards (and account management)
    .then(response => {
        console.log('Success:', JSON.stringify(response));
        localStorage.setItem("JWT", response.JWT);
      }
    )

    // If this fails, it must be a network error and I frankly don't know what
    //   to do...
    .catch(error => console.error("Fatal Error : ", error));
  }
}