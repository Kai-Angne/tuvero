define([ 'vector', 'matrix', 'halfmatrix' ], function (Vector, Matrix,
    HalfMatrix) {
  /**
   * FinebuchholzRanking: A ranking variant which sorts players by wins,
   * buchholz points, finebuchholz points and netto points, in this order.
   */
  var Finebuchholz = function (size) {
    this.wins = [];
    this.netto = [];
    this.games = new HalfMatrix(1, size);

    while (this.netto.length < size) {
      this.netto.push(0);
      this.wins.push(0);
    }
  };

  /**
   * simply return the stored size
   * 
   * @returns the size
   */
  Finebuchholz.prototype.size = function () {
    return this.netto.length;
  };

  /**
   * resize the internal structures
   * 
   * @param size
   *          new size
   * @returns {Finebuchholz} this
   */
  Finebuchholz.prototype.resize = function (size) {
    var length = this.netto.length;

    if (size < length) {
      this.netto.splice(size);
      this.wins.splice(size);
      while (this.games.size > size) {
        this.games.erase(size);
      }
    } else {
      this.games.extend(size - length);

      for (; length < size; length += 1) {
        this.netto.push(0);
        this.wins.push(0);
      }
    }

    return this;
  };

  /**
   * return an object containing all points data and a sorted array of pids
   * representing the ranking
   * 
   * @returns data object
   */
  Finebuchholz.prototype.get = function () {
    var rank, i, n, w, bh, fbh;

    n = this.netto;
    w = this.wins;
    bh = Matrix.multVec(this.games, w); // calculate the buchholz points
    fbh = Matrix.multVec(this.games, bh); // calculate the finebuchholz points

    rank = [];
    for (i = 0; i < n.length; i += 1) {
      rank[i] = i;
    }

    rank.sort(function (a, b) {
      return (w[b] - w[a]) || (bh[b] - bh[a]) || (fbh[b] - fbh[a])
        || (n[b] - n[a]);
    });

    return {
      buchholz : bh,
      finebuchholz : fbh,
      netto : n,
      ranking : rank,
      size : n.length,
      wins : w
    };
  };

  /**
   * Add the result of a game to the ranking table.
   * 
   * @param result
   *          the result
   * @returns {Finebuchholz} this
   */
  Finebuchholz.prototype.add = function (result) {
    var netto, n, w, g, t1, t2;

    n = this.netto;
    w = this.wins;
    g = this.games;

    netto = result.getNetto();
    t1 = result.getTeam(1);
    t2 = result.getTeam(2);

    t1.map(function (v) {
      n[v] += netto;
      if (netto > 0) {
        w[v] += 1;
      }

      t2.map(function (v2) {
        g.set(v, v2, g.get(v, v2) + 1);
      });
    });

    t2.map(function (v) {
      n[v] -= netto;
      if (netto < 0) {
        w[v] += 1;
      }
    });

    return this;
  };

  /**
   * remove the result of a game from the ranking table
   * 
   * @param result
   *          the result
   * @returns {Finebuchholz} this
   */
  Finebuchholz.prototype.remove = function (result) {
    var netto, n, w, g, t1, t2;

    n = this.netto;
    w = this.wins;
    g = this.games;

    netto = result.getNetto();
    t1 = result.getTeam(1);
    t2 = result.getTeam(2);

    t1.map(function (v) {
      n[v] -= netto;
      if (netto > 0) {
        w[v] -= 1;
      }

      t2.map(function (v2) {
        g.set(v, v2, g.get(v, v2) - 1);
      });
    });

    t2.map(function (v) {
      n[v] += netto;
      if (netto < 0) {
        w[v] -= 1;
      }
    });

    return this;
  };

  /**
   * Correct the result of a game.
   * 
   * @param oldres
   *          the old result
   * @param newres
   *          the new (corrected) result
   * @returns {Finebuchholz} this
   */
  Finebuchholz.prototype.correct = function (oldres, newres) {
    this.remove(oldres);
    this.add(newres);

    return this;
  };

  return Finebuchholz;
});