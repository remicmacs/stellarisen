class Favorites {
  constructor(favoritesPanelElt) {
    this.favoritesPanelElt = favoritesPanelElt;
  }

  displayFavoritesPanel() {
    if (sessionStorage.getItem("isAuthenticated") === "true") {
      const usernameHeader = document.getElementById("fav-username");
      usernameHeader.innerHTML = "Top 10 de " + sessionStorage.getItem("username");
    }
  }

  getFavorites() {
  }
}