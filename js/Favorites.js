class Favorites {
  constructor(favoritesPanelElt) {
    this.favoritesPanelElt = favoritesPanelElt;
    this.favoritesList = this.favoritesPanelElt.getElementsByTagName("ol")[0];
    this.source = null;
    this.passedOverElt = null;
  }

  displayFavoritesPanel() {
    if (sessionStorage.getItem("isAuthenticated") === "true") {
      const usernameHeader = document.getElementById("fav-username");
      usernameHeader.innerHTML = "Top 10 de " + sessionStorage.getItem("username");
    }
    this.getFavorites();
  }

  getFavorites() {
    fetch('/api/public/favorites/' + sessionStorage.getItem("username"), {
      method: 'GET'
    })
    .then((res) => res.json())
    .then((json) => {this.produceFavoritesList(json)})
    .catch(error => {
      console.error("Fatal Error : ", error);
    });
  }

  produceFavoritesList(favs) {
    this.favoritesList.innerHTML = "";
    for (let i = 0 ; i < favs.length ; i++) {
      const fav = favs[i];
      const liElt = document.createElement("li");
      liElt.setAttribute("draggable", "true");
      liElt.classList.add(
        "data-row",
        "data-value",
        "alone",
        "link"
      );
      liElt.id = fav;
      liElt.innerHTML = '<b>#'+ (i+1) + ' </b> : ' + fav;
      liElt.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.hash = fav + "-open";
      })

      this.attachEventListeners(liElt);

      this.favoritesList.appendChild(liElt);

    }
  }

  handleDragStart(event) {
    //console.log("Drag started");
    //console.log("Element is ");
    //console.log(event.target);
    event.target.style.opacity = '0.4';
    event.dataTransfer.setDragImage(event.target, 24, 32);

    // Defining dataTransfer object content
    event.dataTransfer.setData('text/plain', event.target.innerHTML);
    event.dataTransfer.effectAllowed = "move";

    this.source = event.target;
  }

  handleDragOver(event) {
    //console.log("you are over ");
    //console.log(event.target);
    //console.log("Node type is " + event.target.nodeType);
    //if (event.preventDefault) {
      event.preventDefault(); // Necessary. Allows us to drop.
    //}

    //console.log("Over : " + event.target.nodeName);

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

    this.passedOverElt = liElt;

    liElt.classList.add("over");


    event.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

    return false;
  }

  handleDragEnter(event) {
    event.preventDefault();
    //console.log("Enter : " + event.target.nodeName);
    if (
      event.target.nodeType === Node.TEXT_NODE
      || event.target.nodeName !== "LI"
    ) {
      return false;
    }
    //console.log("you enter ");
    //console.log(event.target);
    // this / event.target is the current hover target.
    //event.target.classList.add('over');
  }

  handleDragLeave(event) {
    // Removing background-color feedback of element cursor stopped hovering
    this.passedOverElt.classList.remove('over');
  }

  handleDragEnd(event) {
    // Removing background-color feedback of element we dropped on
    this.passedOverElt.classList.remove('over');

    // Resetting opacity
    for (let liElt of this.favoritesList.getElementsByTagName("li")) {
      liElt.style.opacity = '1';
    }
  }


  handleDrop(event) {
    event.preventDefault();
    //console.log("oooohh he dropped it");

    //if (event.stopPropagation) {
      event.stopPropagation(); // stops the browser from redirecting.
    //}

    //console.log("Source :");
    //console.log(this.source);

    //console.log("Bin : ");
    //console.log(event.target);

    const parent = event.target.parentNode

    let list = parent.getElementsByTagName("li");
    list = Array.from(list);

    //console.log(list);

    let sourceId = -1;
    let binId = -1;
    for (let i = 0 ; i < list.length ; i++) {
      if (list[i] === this.source) {
        sourceId = i;
      } else if (list[i] === event.target) {
        binId = i;
      }

      list[i] = list[i].id;
    }

    //console.log("binId = " + binId);
    //console.log("sourceId = " + sourceId);

    let temp = list[sourceId];
    list.splice(sourceId, 1);
    list.splice(binId, 0, temp);

    // delete nodes

    parent.innerHTML = "";

    console.log(list);

    this.produceFavoritesList(list);

    fetch('/api/public/favorites/' + sessionStorage.getItem("username"), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(list)
    })
    .then((res) => res.json())
    .then((res) => {console.log(res); this.produceFavoritesList(res["newlist"]); })
    .catch(error => {
      console.error("Fatal Error : ", error);
    });

    //source.innerHTML = event.target.innerHTML;

    //event.target.innerHTML = event.dataTransfer.getData("text/plain");

    // See the section on the DataTransfer object. */
    return false;

  }



  attachEventListeners(elt) {
    elt.addEventListener('dragstart', (event) => {this.handleDragStart(event)}, false);
    elt.addEventListener('dragover', (event) => {this.handleDragOver(event)}, false);
    elt.addEventListener('dragenter', (event) => {this.handleDragEnter(event)}, false);
    elt.addEventListener('dragleave', (event) => {this.handleDragLeave(event)}, false);
    elt.addEventListener('dragend', (event) => {this.handleDragEnd(event)}, false);
    elt.addEventListener('drop', (event) => {this.handleDrop(event)}, false);
  }

}