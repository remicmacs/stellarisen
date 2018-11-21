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
      return this.displayErrorToast(response);
    }
  }

  displayErrorToast(response) {
    // Recover form parent
    const parent = this.form.parentNode.parentNode;

    this.toaster.displayErrorToast(parent, response.authenticationError, "Login Error");
    // Creating textcard
    /*
    const textCard = document.createElement('article');
    textCard.classList.add(
      "center",
      "mw5",
      "mw6-ns",
      "b--error-red",
      "br3",
      "ba",
      "mv1",
      "shadow-1"
    );
    textCard.id = "auth-textcard-info";

    // Children of textcard
    // Title
    const title = document.createElement("h1");
    textCard.appendChild(title);
    title.classList.add(
      "f4",
      "bg-error-red",
      "white",
      "br3",
      "br--top",
      "mv0",
      "pv2",
      "ph3"
    );
    title.innerHTML = "Login Error";

    // Text body
    const textCardBodyDiv = document.createElement('div');
    textCardBodyDiv.classList.add("pa3", "bt", "b--error-red");
    const paragraph = document.createElement("p");
    textCardBodyDiv.appendChild(paragraph);
    paragraph.innerHTML = response.authenticationError;
    paragraph.classList.add("f6", "f5-ns", "lh-copy", "measure", "mv0");
    textCard.appendChild(textCardBodyDiv);

    parent.appendChild(textCard);

    this.closer(textCard);*/
  }

  handle(event){
    super.handle(event);
    this.connect();
  }
}