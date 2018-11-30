/**
 * Handle favorites panel logic.
 *
 * The management of the favorites is made through a drag and drop interface
 * of an ordered list.
 *
 * @class Favorites
 */
class Favorites {
  /**
   *Creates an instance of Favorites.
   * @param {*} favoritesPanelElt The root element of the panel
   * @memberof Favorites
   */
  constructor(toaster) {
    this.toaster = toaster;
    this.favoritesPanelElt = document.getElementById("favorites-panel");
    // Retrieve reference to list element
    this.favoritesList = this.favoritesPanelElt.getElementsByTagName("ol")[0];

    // State data to keep track of which elements are involved in drag and drop
    this.source = null;
    this.passedOverElt = null;
  }

  /**
   * If the user is authenticated, displays fetches his list of favorites
   *
   * @memberof Favorites
   */
  displayFavoritesPanel() {
    const usernameHeader = document.getElementById("fav-username");
    if (sessionStorage.getItem("isAuthenticated") === "true") {
      usernameHeader.innerHTML =
        "Top 10 de " + sessionStorage.getItem("username");
      this.getFavorites();
    } else {
      usernameHeader.innerHTML = "Qu'est-ce que vous faites ici ?";
      this.toaster.displayErrorToast(
        this.favoritesPanelElt,
        "Vous ne devriez pas arriver ici sans être connecté"
      );
    }
  }

  /**
   * Fetches the favorites by requesting back-end API
   *
   * @memberof Favorites
   */
  getFavorites() {
    fetch('/api/public/favorites/' + sessionStorage.getItem("username"), {
      method: 'GET'
    })
    // Unpacking JSON body of response
    .then((res) => res.json())
    // Displaying list of favorites
    .then((json) => {this.produceFavoritesList(json)})
    .catch(error => {
      console.error("Fatal Error : ", error);
    });
  }

  /**
   * Displays an ordered list of favorites
   *
   * @param {Array} favs List of ordered favorites
   * @memberof Favorites
   */
  produceFavoritesList(favs) {
    // Cleaning previous content
    this.favoritesList.innerHTML = "";

    // Creating a li element for every favorite listed
    for (let i = 0 ; i < favs.length ; i++) {
      const fav = favs[i];

      // Creating draggable element
      const liElt = this.createDraggableLiElement(fav, i);

      this.attachEventListeners(liElt);

      this.favoritesList.appendChild(liElt);
    }
  }

  /**
   * Attach must-have event listeners to implement drag and drop feature.
   *
   * @param {Element} elt the li element that will be attached event listeners
   * @memberof Favorites
   */
  attachEventListeners(elt) {
    elt.addEventListener(
      'dragstart',
      (event) => {this.handleDragStart(event)},
      false
    );

    elt.addEventListener(
      'dragover',
      (event) => {this.handleDragOver(event)},
      false
    );

    elt.addEventListener(
      'dragenter',
      (event) => {this.handleDragEnter(event)},
      false
    );

    elt.addEventListener(
      'dragleave',
      (event) => {this.handleDragLeave(event)},
      false
    );

    elt.addEventListener(
      'dragend',
      (event) => {this.handleDragEnd(event)},
      false
    );

    elt.addEventListener(
      'drop',
      (event) => {this.handleDrop(event)},
      false
    );
  }

  /**
   * Templating function for a list element
   *
   * @param {string} fav The name of the star that must also be a valid hash for
   *    navigation
   * @param {int} index The rank of the celestial object in the list of
   *    favorites
   * @returns
   * @memberof Favorites
   */
  createDraggableLiElement(fav, index) {
    // Creating container li element
    const liElt = document.createElement("li");

    // Setting style and making object draggable
    liElt.setAttribute("draggable", "true");
    liElt.classList.add(
      "data-row",
      "data-value",
      "alone",
      "link"
    );

    // Id attribute will hold valid string name as reference
    liElt.id = fav;
    liElt.innerHTML = '<b>#'+ (index+1) + ' </b> : ' + fav;

    // Attaching event listener to handle link-style navigation
    liElt.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.hash = fav + "-open";
    });

    return liElt;
  }

  /**
   * Handles beginning of drag event.
   *
   * * Make source element transparent for visible feedback
   * * Define drag image visual
   * * Define DataTransfer object data
   * * Define allowed effect (cursor feedback)
   * * Stores source element reference
   *
   * @param {DragEvent} event dragstart event
   * @memberof Favorites
   */
  handleDragStart(event) {
    event.target.style.opacity = '0.4';

    event.dataTransfer.setDragImage(event.target, 24, 32);

    event.dataTransfer.setData('text', event.target.id);

    event.dataTransfer.effectAllowed = "move";

    this.source = event.target;
  }

  /**
   * Handle behavior of hovered element during a drag and drop.
   *
   * @param {*} event
   * @returns
   * @memberof Favorites
   */
  handleDragOver(event) {
    event.preventDefault();

    // Recovering reference to li element
    let liElt;
    const currElt = event.target;
    switch(currElt.nodeName) {
      case "#text":
        liElt = (currElt.parentNode.nodeName === "DIV")
        ? currElt.parentNode.parentNode
        : currElt.parentNode.parentNode.parentNode;
        break;
      case "B":
        liElt = currElt.parentNode.parentNode;
        break;
      case "LI":
        liElt = event.target;
        break;
    }

    // Storing reference to last hovered element for later handling
    this.passedOverElt = liElt;

    // Adds feedback style to element
    liElt.classList.add("over");

    /*
     * The visual feedback of the cursor should be the one authorized in
     * the handleDragStart handler
     */
    event.dataTransfer.dropEffect = 'move';

    return false;
  }

  handleDragEnter(event) {
    event.preventDefault();
  }

  /**
   * When a hovered element is no longer hovered, remove visual feedback.
   *
   * @param {*} event
   * @memberof Favorites
   */
  handleDragLeave(event) {
    // Removing background-color feedback of element cursor stopped hovering
    this.passedOverElt.classList.remove('over');
  }

  /**
   * When drag and drop is done, visual feedback must be removed from last
   * element that was hovered but never leave.
   *
   * @param {*} event
   * @memberof Favorites
   */
  handleDragEnd(event) {
    // Removing background-color feedback of element we dropped on
    this.passedOverElt.classList.remove('over');

    // Resetting opacity
    for (let liElt of this.favoritesList.getElementsByTagName("li")) {
      liElt.style.opacity = '1';
    }
  }


  /**
   * Last step of drag and drop sequence.
   *
   * * Retrieves ol element and list of li elements inside it
   * * 
   *
   * @param {*} event
   * @returns
   * @memberof Favorites
   */
  handleDrop(event) {
    event.preventDefault();
    event.stopPropagation(); // stops the browser from redirecting.

    // 
    const parent = event.target.parentNode

    let list = parent.getElementsByTagName("li");
    list = Array.from(list);

    /*
     * Finding source and target ids while unpacking li element to keep only
     * the star name
     */
    let sourceId = -1;
    let targetId = -1;
    for (let i = 0 ; i < list.length ; i++) {
      if (list[i] === this.source) {
        sourceId = i;
      } else if (list[i] === event.target) {
        targetId = i;
      }

      list[i] = list[i].id;
    }

    // Reordering list of favorites
    let temp = list[sourceId];
    list.splice(sourceId, 1);
    list.splice(targetId, 0, temp);

    // Deleting previous list
    parent.innerHTML = "";

    // Displaying new favorites list
    this.produceFavoritesList(list);

    // Save new order in API
    fetch('/api/public/favorites/' + sessionStorage.getItem("username"), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(list)
    })
    .then((res) => res.json())
    .then((res) => {this.produceFavoritesList(res["newlist"]);})
    .catch(error => {
      console.error("Fatal Error : ", error);
    });
    return false;
  }
}