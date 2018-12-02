/**
 * Super class for form submit event handlers
 *
 * Subclasses : @see RegistrationHandler, @see ConnectionHandler
 */
class FormSubmitHandler {
  /**
   * Creates an instance of FormSubmitHandler.
   *
   * Dependancy injection of Toaster instance to build informational toasts, and
   * the reference to the form Node to attach toast to it.
   * @param {Toaster} toaster
   * @memberof FormSubmitHandler
   */
  constructor(toaster) {
    this.toaster = toaster;
  }

  /**
   * Event handler for form submit event
   *
   * @param {submit} event
   * @memberof FormSubmitHandler
   */
  handle(event) {
    event.preventDefault();

    this.form = event.target

    // Recovering formatted form data for HTTP request
    this.formData = new FormData(this.form);

    // Recovering target URL
    this.url = event.target.action;

    /*
     * Recover form data for sessionStorage
     * A new instance of FormData MUST be created because recovering each key
     * value pair will consume the FormData object and it will be empty when the
     * request should be sent to API
     */
    this.data = {};
    for (const pair of new FormData(this.form)) {
      this.data[pair[0]] = pair[1];
    }
  }

  /**
   * Event handler for connection form
   *
   * Triggered on `submit` event.
   *
   * Intercept normal event behaviour and connects the user with AJAX requests
   *
   * @param {*} event
   * @memberof FormSubmitHandler
   */
  requestAPI() {
    fetch(this.url, {
      method: 'POST',
      body: this.formData, // FormData object has still all values
    })
    .then((res) => this.controlResponse(res))
    .then((res) => this.processResponse(res))

    /*
     * If this fails, it must be a network error and I frankly don't know what
     * to do...
     */
    .catch(error => {
      const parent = this.form.parentNode.parentNode;

      console.error("Fatal Error : ", error);
      this.toaster.displayErrorToast(
        parent,
        error,
        "Erreur fatale : "
      )
    });
  }

  /**
   * Extracts the status code of HTTP response and unpacks JSON data.
   *
   * @param {*} response
   * @returns Promise
   * @memberof FormSubmitHandler
   */
  controlResponse(response) {
    // Recover response status
    this.success = (response.status === 200);

    // Unpacks response body (returns Promise)
    return response.json();
  }

  /**
   * Process any kind of response.
   *
   * Two basic types of response are possible : Success or Error
   *
   * @param {*} response
   * @returns
   * @memberof FormSubmitHandler
   */
  processResponse(response) {
    if (this.success) {
      // Initiate a session
      sessionStorage.setItem("username", this.data.username);
      sessionStorage.setItem("isAuthenticated", "true");

      showMenu();

      const elements = document.querySelectorAll("#menu-panel .column");
      const columnMenu = elements[0];

      this.toaster.displaySuccessToast(
        columnMenu,
        this.action + " réussie !"
      );

    // If code is not 200 => display information in red modal div
    } else {
      // Recover form parent
      const parent = this.form.parentNode.parentNode;

      return this.toaster.displayErrorToast(
        parent,
        response.message,
        ""+ this.action + " error:"
      );
    }
  }
}