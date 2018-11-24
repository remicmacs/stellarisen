/**
 * Class to hold all state and methods for login process
 *
 * @class ConnectionHandler
 * @extends {FormSubmitHandler}
 */
class ConnectionHandler extends FormSubmitHandler {
  constructor(toaster) {
    super(toaster);
    this.action = "Connection";
  }

  handle(event){
    super.handle(event);
    this.requestAPI();
  }
}