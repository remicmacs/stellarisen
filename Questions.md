# What I don't get

Why the `Mesh` object needs to be fed with informations

```js
this.mesh.name = this.meshName;
this.mesh.userData = { "type": "star" };
```

for instance

or :

```js
this.position = this.mesh.position;
this.rotation = this.mesh.rotation;
this.scale = this.mesh.scale;
```
conversely ?

Only the mesh object is not enough?


Why `Star.getScaleFactor()` is both static and not static ?

What are ra and dec for objects ?

There is some hidden quadratic complexity in Constellation.isPresent
Is it possible to implement it with a HashMap ? === Object

More parameters check is needed // weak typing


Why is it the responsability of the Objects to add themselves to the Scene ?

Beware weak comparisons. If you are not sure, use `===` and `!==`

closeInfos closePInfos : what is the difference ?