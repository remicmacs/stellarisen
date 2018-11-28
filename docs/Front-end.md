# Front-end

## Structure

L'ensemble du site est défini dans une seule page HTML qui comprend l'ensemble des éléments ne faisant pas partie des scènes 3D (panneaux d'informations et menu). Les scènes 3D sont initialisées et affichées à l'aide de JavaScript.

### Les dialogues

Les informations et menus sont regroupées dans des dialogues. Il existe 3 dialogues qui sont positionnés à gauche, au centre, et à droite (ou en haut sur mobile). Ces dialogues pouvant afficher des informations différentes (par exemple le dialogue gauche, utilisé par le menu, peut aussi afficher la page de login), ils contiennent différents panels qui seront affichés/cachés dynamiquement en fonction des informations que l'on veut faire apparaître dans le dialogue.

L'apparition/disparition des dialogues est gérées par le JavaScript lors des évènements de click, en ajoutant/supprimant les classes `hidden`/`visible`.

L'apparition/disparition des panels est aussi gérée par le JavaScript en utilisant les mêmes classes. Afin de simplifier la gestion des différents panels dans un même dialogue, nous avons écrit des fonctions de simplification dans `utils.js`

### Les caméras

#### Voûte étoilée

Sur la voûte étoilée, la caméra est une caméra en perspective. Cette caméra est intégrée dans un Object3D, lui même intégré dans un Object3D. La gestion des rotations en x et en y de ces Object3D permet d'appliquer des rotations indépendantes et d'éviter les problèmes d'orientation intrinsèques aux rotations dans les repêres sphériques.

La rotation peut se faire de deux manières différentes, en fonction de l'appareil utilisé et de la manière dont l'utilisateur interagit. 

Sur plateforme desktop, la rotation de la caméra se fait en tirant à l'aide de la souris. Des fonctions attachées aux évènements d'appui et de relâchement de souris, ainsi que sur le mouvement de la souris, détectent un déplacement par tirage et modifie les rotations des objets contenant la caméra.

Sur plateforme mobile, la rotation de la caméra peut se faire soit à l'aide de l'accélèrométre, soit en tirant à l'aide du doigt. La rotation par accélèrométre utilise le script `DeviceOrientationControls.js` disponible dans les exemples livrés avec Three.js. Lorsque l'utilisateur déplace la caméra à l'aide du doigt, ou lorsqu'il clique sur un élément cliquable, la rotation par accélèrométre se désactive pour basculer sur le même système que sur plateforme desktop. L'utilisateur peut rebasculer sur la rotation par accélèrométre à l'aide d'un bouton dans le menu.

#### Système solaire

Pour la vue du système solaire, nous avons adopté une caméra orthographique pour éviter la déformation due à la perspective. L'avantage d'une caméra orthographique est l'affichage des longueurs à la même échelle, peu importe leur distance. L'inconvénient est que, pour zoomer, on ne peut pas juste rapprocher la caméra de l'écran : il faut jouer avec les frontières du plan de projection.

## JavaScript

### Three.js

[Three.js](https://threejs.org/) est une librairie javascript permettant la rendu d'une scène 3D sur une balise de rendu canvas. Three.js utilise des technologies telles que WebGL, CSS3D et SVG. 

### Tween.js

[Tween.js](https://github.com/tweenjs/tween.js/) est une librairie permettant de faire de l'interpolation de propriétés et qui implémente plusieurs fonctions d'interpolation.

Pour créer un Tween, il faut d'abord définir un objet source et un objet cible. Ceux-ci sont des dictionnaires comprenant les mêmes clés auxquelles sont associées les valeurs désirées. Le Tween peut alors être créé :

```javascript
let coord = { x: 0 };
let end = { x: 24 };
let tween = new TWEEN.Tween(start).to(end, 1000);
```

À ceci, il peut être nécessaire d'ajouter une fonction qui se chargera de mettre à jour les valeurs que l'on veut voir interpolées à l'aide du callback onUpdate de Tween.js : 

```javascript
tween.onUpdate(() => {
	myObject.position.x = coord.x;
});
```

Enfin, il est possible d'accomplir une action lors que l'interpolation est finie :

```javascript
tween.onCompleted(() => {
	console.log("Fini !");
});
```

Bien sûr, il ne faut pas oublier de démarrer le Tween une fois celui-ci complétement défini avec `tween.run()`. La combinaison de ces 3 éléments est suffisante pour la plupart des besoins que nous ayons rencontrés. En fonction de l'animation désirée, il est aussi possible de choisir une fonction d'interpolation différente de celle par défaut (linéaire), par exemple :

```javascript
tween.easing(TWEEN.Easing.Quadratic.Out);
```

Dans notre projet, nous utilisons Tween.js pour les animations de déplacement lors du clic sur un objet (étoile, planète ou lune).

### Classes

Les classes sont définies selon le modèle introduits avec ECMAScript 2015. Ceci afin de garder une syntaxe plus proche des langages étudiés en cours tels que Java ou PHP. Au niveau de la structure de fichiers, nous avons choisi de faire un fichier par classe. Pour la partie front-end, nous avons 10 classes :

* Planets : il s'agit de la scène d'affichage des planètes et des lunes
* SkyMap : il s'agit de la scène d'affichage de la voûte étoilée
* Planet : définie une planète, sa géométrie, des fonctions d'aides pour l'affichage et la rotation de celle-ci, et les lunes qu'elle comprend
* Moon : définie une lune, sa géométrie, et des fonctions d'aides pour l'affichage et la rotation de celle-ci
* Star : définie une étoile, ses informations, et sa géométrie
* Constellation : définie une constellation, et les étoiles et les liens qu'elle comprend
* Link : définie un lien entre deux étoiles
* Visor : définie le viseur utilisé dans la voûte céleste
* Horizon : définie les deux barres séparant l'hémisphère Nord de l'hémisphère Sud dans la voûte céleste, et les points cardinaux
* Toaster : il s'agit d'un élément DOM affiché lors d'une erreur de connexion

Les autres classes ne définissent pas d'éléments graphiques et ressortent donc plus du domaine du back-end.

## CSS

La plupart du CSS a été écris à la main dans une approche modulaire par classes. En support du CSS que nous avons produit nous-même, nous avons utilisé [Tachyons](https://tachyons.io), un framework CSS 
qui implémente un style simple et responsive.

Le CSS est aussi responsable des animations et transitions qui ne concernent pas la scène 3D.
