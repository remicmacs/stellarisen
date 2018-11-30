/**
 * Class to hold every needed state and handlers for the registration process.
 *
 * @class RegistrationHandler
 * @extends {FormSubmitHandler}
 */
class RegistrationHandler extends FormSubmitHandler{
  constructor(toaster) {
    super(toaster);
    this.action = "Inscription";
  }

  handle(event) {
    super.handle(event);

    const validpassword = this.validatePassword();

    // Send register request only if password is correct in both fields
    return validpassword && this.requestAPI();
  }

  /**
   * Client-side validation of password confirmation field
   *
   * @param {Object} data Dictionnary of all input values in form
   * @returns boolean value
   * @memberof RegistrationHandler
   */
  validatePassword() {
    if (this.data.password !== this.data.repassword) {
      const parent = this.form.parentNode.parentNode;
      this.toaster.displayErrorToast(
        parent,
        "Le mot de passe et la confirmation doivent correspondre",
        "Erreur d'enregistrement :"
      );
      return false;
    }
    return true;
  }
}