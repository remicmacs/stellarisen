# Front-end

## Structure

The whole website is defined in a single HTML page which includes all the elements that does not belong to the 3D scenes (information panels and menus). 3D scenes are initialized and displayed using JavaScript.

### Dialogs

Information dialogs and menus are grouped in modal dialogs. There is 3 kinds of dialogs which are placed on the left, on the center, and on the right (or the top, depending on the platform). Since these dialogs can display differents informations (for example, the left modal dialog, used by the menu, can also display the login page), they contains panels which are displayed/hidden dynamically based on the information we want to display.

Hidding/displaying dialogs is managed by the JavaScript on click events, by adding/removing the `hidden`/`visible` classes.

Hidding/displaying panels is also manage by the JavaScript by using the same classes. In order to simplify the panels management in a same modal dialog, we have written a few functions in `utils.js`.

### Cameras

#### Star map

In the star map, the camera is a perspective camera. This camera is included in an Object3D (called `pitchObject`), which is included in another Object3D (called `yawObject`). This way, we can rotate the camera around the y angle by rotating the `yawObject` and around the x angle by rotating the `pitchObject` without having to deal with the issues caused by rotations in a spherical coordinates system.

Camera's rotation is managed in two different ways, depending on the device et the way the user interact with it.

On a desktop device, camera's rotation is obtained by dragging with the mouse. Listeners on `mouseup`, `mousedown`, and `mousemove` rotates the objects in which the camera is included in accordance with the movement made by the user.

On a mobile device, camera's rotation can be obtained either by dragging with the finger or by using the device's orientation. Device's orientation is managed by the `DeviceOrientationControls.js` script which is included in the Three.js examples. When the user moves the camera by dragging with the finger, or when he clicks on an element, the device's orientation is disabled and we switch to the same system than on desktop. The user can switch back to device's orientation by pressing a button in the menu.

#### Solar system

For the solar system, we chose an orthographic camera to avoid any deformation caused by the perspective. The advantage of an orthographic camera is that the lengths stays the same, no matter what our distance with the object is. The drawback is that for zooming on an object, we can't just bring the camera closer to the object : we have to play with the projection plane's limits.

![Perspective camera vs orthographic camera](./res/cameras.png)

## JavaScript

### Three.js

[Three.js](https://threejs.org/) is a JavaScript library for rendering a 3D scene on a canvas DOM element. Three.js uses technologies like WebGL, CSS3D and SVG.

### Tween.js

[Tween.js](https://github.com/tweenjs/tween.js/) is a javascript library for interpolating between two values (also called *tweening*) which includes multiple interpolation functions.

To create a Tween, we first have to define a source and an target object. These are dictionaries containing the same key with the desired values. The Tween can then be created:

```javascript
let coord = { x: 0 };
let end = { x: 24 };
let tween = new TWEEN.Tween(start).to(end, 1000);
```

We then need to add a function that will update the real values we want to be tweened by defining the `onUpdate` callback:

```javascript
tween.onUpdate(() => {
	myObject.position.x = coord.x;
});
```

Finally, we can do an action when the Tween is finished by defining the `onComplete` callback:

```javascript
tween.onComplete(() => {
	console.log("Finished!");
});
```

Of course, we shouldn't forget to start the Tween by running `tween.run()`. The combination of those three instructions is enough for most of our needs. Depending on the animation wanted, we can choose another tweening function, different from the default one, for example:

```javascript
tween.easing(TWEEN.Easing.Quadratic.Out);
```

In our project, we're using Tween.js for all the movements when we're clicking on an object (star, planet or moon...).

### Classes

The classes in our code is defined the way it was introduced in ECMAScript 2015 so we can keep a syntax that is closer to the languages seen in class like Java or PHP. For readability and maintainability purposes, we decided to follow the "one class one file"-rule.

For the front-end part, we have defined 10 classes:

* Planets: it is the 3D scene for the planets and the moons
* Skymap: it is the 3D scene for the star map
* Planet: defines a planet, its geometry, its informations, and helping functions for displaying it
* Moon: defines a moon, its geometry, its informations, and helping functions for displaying it
* Star: defines a star, its geometry, and its informations
* Constellation: defines a constellation, the stars it includes, and the links between them
* Link: defines a visible link between two stars in a constellation
* Visor: defines the visor used in the star map
* Horizon: defines the two bars separating the north hemisphere with the south hemisphere, and the cardinal points
* Toaster: a DOM element displayed when there is an issue with the login

The other classes doesn't define a graphical elements and are used by the back-end.

## CSS

Most of the CSS have been written by hand (artisanally-made CSS) in a modular way, using classes. We also used [Tachyons](https://tachyons.io), a CSS framework which implements a simple and responsive style.

The CSS is also responsible for the animations and transitions of the DOM elements (this excludes the 3D scene).