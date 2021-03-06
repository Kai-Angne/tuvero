# scripts/backend/buchholzranking.js


No Description

* Author: Erik E. Lorenz 
* Mail: <erik.e.lorenz@gmail.com>
* License: MIT License


## Dependencies

* <a href="./halfmatrix.html">./halfmatrix</a>
* <a href="./matrix.html">./matrix</a>
* <a href="./vector.html">./vector</a>

## Functions

###   var Buchholz = function (size)
BuchholzRanking: A ranking variant which sorts players by wins, buchholz
points and netto points, in this order.

---


###   Buchholz.prototype.size = function ()
simply return the stored size


**Returns:** the size

---


###   Buchholz.prototype.resize = function (size)
resize the internal structures

**Argument:** **size**

new size

**Returns:** {Buchholz} this

---


###   Buchholz.prototype.get = function ()
return an object containing all points data and a sorted array of pids
representing the ranking


**Returns:** data object

---


###   Buchholz.prototype.add = function (result)
Add the result of a game to the ranking table.

**Argument:** **result**

the result

**Returns:** {Buchholz} this

---


###   Buchholz.prototype.remove = function (result)
remove the result of a game from the ranking table

**Argument:** **result**

the result

**Returns:** {Buchholz} this

---


###   Buchholz.prototype.correct = function (correction)
Correct the result of a game.

**Argument:** **oldres**

the old result
**Argument:** **newres**

the new (corrected) result

**Returns:** {Buchholz} this

---


###   Buchholz.prototype.grantBye = function (team)

---

###   Buchholz.prototype.revokeBye = function (team)

---

###   Buchholz.prototype.added = function (game)
whether a game was played

**Argument:** **game**

an instance of the game that could have taken place

**Returns:** true if all data indicates that this game took place, false
otherwise.

---


###     t1func = function (p1)

---

###   Buchholz.prototype.getCorrections = function ()
get a copy of the applied corrections


**Returns:** copy of the array of corrections

---


###   Buchholz.prototype.toBlob = function ()
stores the current state in a blob


**Returns:** the blob

---


###   Buchholz.prototype.fromBlob = function (blob)

---

###     function copyCorrection (corr)

---

## Metrics

* 337 Lines
* 6851 Bytes

