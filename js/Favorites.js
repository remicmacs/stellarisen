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
    for (let fav of favs) {
      const liElt = document.createElement("li");
      liElt.classList.add("f4");
      liElt.innerHTML = fav;

      this.favoritesList.appendChild(liElt);

    }
  }
}