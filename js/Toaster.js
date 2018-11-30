/**
 * Class to build and attach toast messages
 *
 * @class Toaster
 */
class Toaster {

  /**
   * Build and attach a toast to a parent element
   *
   * Three types of toast are available : "error", "success" and "information"
   * @param {Node} parent Parent node which will hold the toast
   * @param {*} message
   * @param {string} type "error"|"success"|"information"
   */
  displayGenericToast(parent, message, type) {
    let color;
    let messageTitle;
    switch(type) {
      case "error":
        color = "error-red";
        messageTitle = '<b class="white">Erreur : </b>';
        break;
      case "success":
        color = "success-green";
        messageTitle = '<b class="white">OK : </b>';
        break;
      case "information":
      default:
        color = "information-blue";
        messageTitle = '<b class="white">Info : </b>';
        break;
    }

    const toast = document.createElement("p");
    toast.classList.add(
      "f4",
      "bg-"+color,
      "white",
      "br3",
      "mv0",
      "mh3",
      "pv2",
      "ph3",
      "shadow-5"
    );
    toast.innerHTML = messageTitle + message; // Title content

    // Adding textCard as children of the parent node
    parent.appendChild(toast);

    // @TODO: Set constant as global or inject value as parameter
    const timeoutDuration = 3;
    window.setTimeout(() => toast.remove(), timeoutDuration * 1000);
  }

  displayErrorToast(parent, errorMessage) {
    this.displayGenericToast(parent, errorMessage, "error");
  }

  displaySuccessToast(parent, successMessage) {
    this.displayGenericToast(parent, successMessage, "success");
  }

  displayInformationToast(parent, infoMessage) {
    this.displayGenericToast(parent, infoMessage, "information");
  }
}