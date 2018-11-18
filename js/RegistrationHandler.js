class RegistrationHandler extends FormSubmitHandler{
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
    .then(response => {
        console.log('Registration success:', JSON.stringify(response));
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
    this.register();
  }
}