class FormSubmitHandler {
  handle(event) {
    event.preventDefault();
    // Recovering form data
    this.data = new FormData(event.target);

    /*
    // Debug
    const otherdata = {};
    for (const pair of new FormData(event.target)) {
      otherdata[pair[0]] = pair[1];
    }
    console.log(otherdata);
    */

    // Recovering target URL
    this.url = event.target.action;
  }
}