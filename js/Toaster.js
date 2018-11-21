class Toaster {
  displayErrorToast(parent, errorMessage, errorType) {
    // Recover form parent
   // const parent = this.form.parentNode.parentNode;

    // Creating textcard
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
    //textCard.id = "auth-textcard-info";

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
    title.innerHTML = errorType;

    // Text body
    const textCardBodyDiv = document.createElement('div');
    textCardBodyDiv.classList.add("pa3", "bt", "b--error-red");
    const paragraph = document.createElement("p");
    textCardBodyDiv.appendChild(paragraph);
    paragraph.innerHTML = errorMessage;
    paragraph.classList.add("f6", "f5-ns", "lh-copy", "measure", "mv0");
    textCard.appendChild(textCardBodyDiv);

    parent.appendChild(textCard);

    const timeoutDuration = 5;

    this.closeCountdown(textCard, timeoutDuration);
  }

  closeCountdown(element, timeoutDuration) {
    window.setTimeout(() => element.remove(), timeoutDuration * 1000);
  }
}