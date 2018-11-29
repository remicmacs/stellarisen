class Favorites {
  constructor(favoritesPanelElt) {
    this.favoritesPanelElt = favoritesPanelElt;
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
    .then(console.log)
    .catch(error => {
      console.error("Fatal Error : ", error);
    });
  }
}