class Favorites {
  constructor(favoritesPanelElt) {
    this.favoritesPanelElt = favoritesPanelElt;
    this.favoritesList = this.favoritesPanelElt.getElementsByTagName("ol")[0];
  }

  displayFavoritesPanel() {
    if (sessionStorage.getItem("isAuthenticated") === "true") {
      const usernameHeader = document.getElementById("fav-username");
      usernameHeader.innerHTML = "Top 10 de " + sessionStorage.getItem("username");
    }
    const favList = this.getFavorites();
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
      liElt.classList.add("data-row");

      const divElt = document.createElement("div");
      divElt.classList.add(
        "data-value",
        "alone",
        "link"
      );
      divElt.innerHTML = '<b>#'+ (i+1) + ' </b>    ' + fav;
      divElt.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.hash = fav + "-open";
      })

      liElt.appendChild(divElt);

      this.favoritesList.appendChild(liElt);

    }
  }
}