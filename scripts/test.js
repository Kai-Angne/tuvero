/*
 * Vector Tests
 */
require([ "vector" ], function (Vector) {
  QUnit.test("Vector", function () {
    var vec, ret, i;

    QUnit.deepEqual(Vector.copy([]), [], "copy empty vector");

    vec = [ 1, 2, 3, 4, 5 ];
    QUnit.deepEqual(Vector.copy(vec), vec, "copy populated vector");

    vec = [ 1 ];
    vec[4] = 5;
    QUnit.deepEqual(Vector.copy(vec), vec, "copy sparse vector");

    QUnit.equal(Vector.dot([], []), 0, "dow with both operands empty");
    QUnit.equal(Vector.dot([ 1, 2, 3, 4, 5 ], []), 0, "dot operand a empty");
    QUnit.equal(Vector.dot([], [ 1, 2, 3, 4, 5 ]), 0, "dow operand b empty");
    QUnit.equal(Vector.dot([ 1, 2, 3 ], [ 3, 2, 1 ]), 10,
        "dot return value check");

    vec = [];
    vec[5] = 0;
    ret = Vector.fill(vec);

    QUnit.equal(ret, vec, "fill return value provided");
    QUnit.equal(vec.length, 6, "fill vector size retained");
    for (i = 0; i < 5; i += 1) {
      QUnit.equal(vec[i], 0, "fill element " + i + " successfully filled");
    }

    QUnit.equal(vec[5], 0, "fill preset element retained");

    vec = [ 1, 2, 3 ];
    ret = Vector.scale(vec, 1);
    QUnit.deepEqual(ret, vec, "scale identity");
    QUnit.deepEqual(Vector.scale([ 1, 2, 3 ], 0), [ 0, 0, 0 ],
        "scale by 0 retains size");
    QUnit.deepEqual(Vector.scale([ 1, 2, 0 ], -0.3), [ -0.3, 2 * -0.3, 0 ],
        "scale negative float factor");

    QUnit.equal(Vector.sum([]), 0, "sum empty vector");
    QUnit.equal(Vector.sum([ 1, 2, 3, 4 ]), 10, "sum populated vector");

    vec = [];
    vec[3] = 5;
    vec[6] = 3;
    QUnit.equal(Vector.sum(vec), 8, "sum sparse vector");
  });
});

/*
 * FullMatrix Tests
 */
require([ "fullmatrix" ], function (FullMatrix) {
  QUnit.test("FullMatrix", function () {
    // constructor validation
    var a, b;

    a = new FullMatrix();
    QUnit.equal(a.size, 0, "empty size initialization");
    QUnit.deepEqual(a.array, [], "empty array initialization");

    a = new FullMatrix(5);
    QUnit.equal(a.size, 5, "prefixed size initialization");
    QUnit.deepEqual(a.array, [], "prefixed array initialization");

    // clear
    b = new FullMatrix(8);
    b.clear(5);
    QUnit.deepEqual(b, a, "clear validation");

    // extend
    b = (new FullMatrix(4)).extend();
    QUnit.deepEqual(b, a, "extend() validation");

    b = (new FullMatrix(4)).extend(1);
    QUnit.deepEqual(b, a, "extend(1) validation");

    b = (new FullMatrix(5)).extend(0);
    QUnit.deepEqual(b, a, "extend(0) validation");

    b = (new FullMatrix(0)).extend(5);
    QUnit.deepEqual(b, a, "extend(0) validation");

    // clone, get and set
    a.clear(3);
    a.array[0] = [ 1, 2, 3 ];
    a.array[1] = [];
    a.array[1][2] = 4;

    QUnit.deepEqual(a.clone(), a, "clone");

    b.clear(3);
    b.set(0, 0, 1).set(0, 1, 2).set(0, 2, 3).set(1, 2, 4);
    QUnit.deepEqual(b, a, "chained set() commands");

    delete a.array[1][2];
    b.set(1, 2, 0);
    QUnit.deepEqual(b, a, "set(0) undefines the element");

    QUnit.equal(b.get(0, 0) === 1 && b.get(0, 1) === 2 && b.get(0, 2) === 3
      && b.get(0, 4) === 0 && b.get(1, 0) === 0 && b.get(1, 2) === 0
      && b.get(2, 3) === 0 && b.get(4, 4) === 0, true, "get QUnit.test");

    // erase
    a = new FullMatrix(3);
    a.array = [ [ 1, 2, 3 ], [ 4, 5 ], [ undefined, undefined, 7 ] ];
    b = new FullMatrix(2);
    b.array = [ [ 1, 3 ], [ undefined, 7 ] ];
    QUnit.deepEqual((new FullMatrix()).erase(0), new FullMatrix(),
        "erase row from matrix of size 0");
    QUnit.deepEqual((new FullMatrix(3)).erase(0), new FullMatrix(2),
        "erase row from empty matrix");
    QUnit.deepEqual(a.erase(1), b, "erase row from sparse matrix");
  });
});

/*
 * HalfMatrix Tests
 */
require([ "halfmatrix" ], function (HalfMatrix) {
  QUnit.test("HalfMatrix", function () {
    var a, b;

    // constructor validation
    a = new HalfMatrix();
    QUnit.equal(a.size, 0, "empty size initialization");
    QUnit.deepEqual(a.array, [], "empty array initialization");

    a = new HalfMatrix(0, 5);
    QUnit.equal(a.size, 5, "prefixed size initialization");
    QUnit.deepEqual(a.array, [], "prefixed array initialization");

    // clear
    b = new HalfMatrix(0, 8);
    b.clear(5);
    QUnit.deepEqual(b, a, "clear validation");

    // extend
    b = (new HalfMatrix(0, 4)).extend();
    QUnit.deepEqual(b, a, "extend() validation");

    b = (new HalfMatrix(0, 4)).extend(1);
    QUnit.deepEqual(b, a, "extend(1) validation");

    b = (new HalfMatrix(0, 5)).extend(0);
    QUnit.deepEqual(b, a, "extend(0) validation");

    b = (new HalfMatrix(0, 0)).extend(5);
    QUnit.deepEqual(b, a, "extend(0) validation");

    // clone, get and set
    a.clear(3);
    a.array = [ [ 1 ], [ undefined, 2 ], [ 3, 4 ] ];

    QUnit.deepEqual(a.clone(), a, "clone");

    b.clear(3);
    b.set(0, 0, 1).set(0, 2, 5).set(1, 1, 2).set(2, 0, 3).set(2, 1, 4);
    QUnit.deepEqual(b, a, "chained set() commands (top half ignored)");

    delete a.array[1][2];
    b.set(1, 2, 0);
    QUnit.deepEqual(b, a, "set(0) undefines the element");

    QUnit.ok(b.get(0, 0) === 1 && b.get(1, 0) === 0 && b.get(1, 1) === 2
      && b.get(2, 0) === 3 && b.get(2, 1) === 4 && b.get(2, 2) === 0,
        "get QUnit.test");

    // erase
    a = new HalfMatrix(0, 3);
    a.array = [ [ 1, 2, 3 ], [ 4, 5 ], [ undefined, undefined, 7 ] ];
    b = new HalfMatrix(0, 2);
    b.array = [ [ 1, 3 ], [ undefined, 7 ] ];
    QUnit.deepEqual((new HalfMatrix()).erase(0), new HalfMatrix(),
        "erase row from matrix of size 0");
    QUnit.deepEqual((new HalfMatrix(3)).erase(0), new HalfMatrix(2),
        "erase row from empty matrix");
    QUnit.deepEqual(a.erase(1), b, "erase row from sparse matrix");

    // HalfMatrix.type QUnit.tests
    // empty
    a = new HalfMatrix(HalfMatrix.empty);
    b = new HalfMatrix(0);
    QUnit.deepEqual(b, a, "HalfMatrix.empty constant");

    a.extend(5).set(2, 2, 1).set(0, 2, 2).set(2, 0, 3);
    QUnit.ok(a.get(2, 2) === 1 && a.get(0, 2) === 0 && a.get(2, 0) === 3,
        "empty get()");

    // mirrored
    a = new HalfMatrix(HalfMatrix.mirrored);
    b = new HalfMatrix(1);
    QUnit.deepEqual(b, a, "HalfMatrix.mirrored constant");

    a.extend(5).set(2, 2, 1).set(0, 2, 2).set(2, 0, 3);
    QUnit.ok(a.get(2, 2) === 1 && a.get(0, 2) === 3 && a.get(2, 0) === 3,
        "mirrored get()");

    // negated
    a = new HalfMatrix(HalfMatrix.negated);
    b = new HalfMatrix(-1);
    QUnit.deepEqual(b, a, "HalfMatrix.negated constant");

    a.extend(5).set(2, 2, 1).set(0, 2, 2).set(2, 0, 3);
    QUnit.ok(a.get(2, 2) === 1 && a.get(0, 2) === -3 && a.get(2, 0) === 3,
        "negated get()");
  });
});

/*
 * Matrix Tests
 */
require([ "matrix", "fullmatrix", "vector" ], function (Matrix, FullMatrix,
    Vector) {
  QUnit.test("Matrix", function () {
    var a, b, vec, out, transpose, expected;

    // using FullMatrix implementation due to
    // generality
    a = new FullMatrix(3);
    a.array = [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ] ];
    out = new FullMatrix(5);

    transpose = new FullMatrix(3);
    transpose.array = [ [ 1, 4, 7 ], [ 2, 5, 8 ], [ 3, 6, 9 ] ];
    QUnit.deepEqual(Matrix.transpose(a.clone()), transpose,
        "transpose: return value validation");

    out = new FullMatrix(5);

    b = new FullMatrix(2);
    QUnit.deepEqual(Matrix.mult(a, b, out), undefined,
        "Matrix.mult: abort on different sizes Matrix");
    QUnit.deepEqual(out, new FullMatrix(),
        "Matrix.mult: output matrix cleared on abort");

    b.extend();
    b.array = [ undefined, [ 7, 9, 5 ], [ undefined, 3, undefined ] ];
    expected = new FullMatrix(3);
    expected.array = [ [ 14, 27, 10 ], [ 35, 63, 25 ], [ 56, 99, 40 ] ];
    QUnit.deepEqual(Matrix.mult(a, b, out), expected, "Matrix multiplication");

    vec = [ 1, 2, 3 ];
    a = new FullMatrix();
    QUnit.deepEqual(Matrix.multVec(b, []), [ 0, 0, 0 ],
        "multVec with empty vector");
    QUnit.deepEqual(Matrix.vecMult([], b), [ 0, 0, 0 ],
        "vecMult with empty vector");
    QUnit.deepEqual(Matrix.multVec(a, vec), [], "multVec with empty matrix");
    QUnit.deepEqual(Matrix.vecMult(vec, a), [], "vecMult with empty matrix");
    QUnit.deepEqual(Matrix.multVec(b, vec), [ 0, 40, 6 ], "multVec check");
    QUnit.deepEqual(Matrix.vecMult(vec, b), [ 14, 27, 10 ], "vecMult check");

    // getRow und getCol
    QUnit.deepEqual(Matrix.getRow(b, 1), [ 7, 9, 5 ],
        "getRow with populated row");

    vec = Matrix.getRow(b, 2);
    QUnit.deepEqual(vec, [ 0, 3, 0 ], "getRow with sparse row");

    QUnit.deepEqual(Matrix.getRow(b, 0), [ 0, 0, 0 ], "getRow with empty row");

    out = Matrix.transpose(b.clone());
    QUnit.deepEqual(Matrix.getCol(out, 1), [ 7, 9, 5 ],
        "getCol with populated col");
    QUnit.deepEqual(Matrix.getCol(out, 2), [ 0, 3, 0 ],
        "getCol with sparse col");
    vec = Matrix.getCol(out, 0);
    QUnit.deepEqual(vec, [ 0, 0, 0 ], "getCol with empty col");

    // sums
    QUnit.deepEqual(Matrix.rowSum(b, 1), 21, "rowSum populated row");
    QUnit.deepEqual(Matrix.rowSum(b, 2), 3, "rowSum sparse row");
    QUnit.deepEqual(Matrix.rowSum(b, 0), 0, "rowSum empty row");

    QUnit.deepEqual(Matrix.colSum(out, 1), 21, "colSum populated row");
    QUnit.deepEqual(Matrix.colSum(out, 2), 3, "colSum sparse row");
    QUnit.deepEqual(Matrix.colSum(out, 0), 0, "colSum empty row");

    QUnit.deepEqual(Matrix.rowSums(a), [], "rowSums with matrix of size 0");
    QUnit.deepEqual(Matrix.rowSums(b), [ 0, 21, 3 ],
        "rowSums with sparse matrix");
    QUnit.deepEqual(Matrix.colSums(a), [], "colSums with matrix of size 0");
    QUnit.deepEqual(Matrix.colSums(out), [ 0, 21, 3 ],
        "colSums with sparse matrix");
  });
});

/*
 * Map Tests
 */
require([ "map" ], function (Map) {
  QUnit.test("Map", function () {
    var map, a, b, c;

    map = new Map();
    QUnit.equal(map.size(), 0, "empty map size");

    a = map.insert(5);
    b = map.insert(4);
    c = map.insert(3);

    QUnit.equal(map.size(), 3, "full map size (absolute)");
    QUnit.equal(map.size(), c + 1, "full map size (relative)");

    QUnit.equal(map.find(1), -1, "correct failure on missing element");
    QUnit.equal(map.find(5), a, "first index");
    QUnit.equal(map.find(4), b, "second index");
    QUnit.equal(map.find(3), c, "third index");
    QUnit.equal(map.at(a), 5, "first value");
    QUnit.equal(map.at(b), 4, "second value");
    QUnit.equal(map.at(c), 3, "third value");

    map.erase(1);
    QUnit.equal(map.size(), 2, "reduced map size");
    QUnit.equal(map.at(a), 5, "first reduced value");
    QUnit.equal(map.at(b), 3, "third reduced value");
    QUnit.equal(map.find(3), b, "third reduced index");

    map.remove(5);
    QUnit.equal(map.size(), 1, "further reduced map size");
    QUnit.equal(map.find(3), 0, "third further reduced index");

    map.remove(3);
    QUnit.equal(map.size(), 0, "completely reduced map size");
  });
});

/*
 * Result Tests
 */
require([ "result" ], function (Result) {
  QUnit.test("Result", function () {
    var a, b, c, pa, pb, res;

    a = 1;
    b = [ 2, 3 ];
    c = [ 2, 3 ];

    pa = 5;
    pb = 13;

    res = new Result(a, b, pa, pb);

    // team tests
    QUnit.equal(res.getTeam(), undefined, "undefined team request");
    QUnit.equal(res.getTeam(0), undefined, "0 team request");
    QUnit.equal(res.getTeam(b), undefined, "array team request");
    QUnit.deepEqual(res.getTeam(2), b, "team constructed by array");
    b[1] = 5;
    QUnit.deepEqual(res.getTeam(2), c, "team copied in constructor");
    QUnit.deepEqual(res.getTeam(1), [ a ], "team constructed by integer");

    // points tests
    QUnit.equal(res.getPoints(), undefined, "undefined points request");
    QUnit.equal(res.getPoints(0), undefined, "0 points request");

    QUnit.equal(res.getPoints(1), pa, "points of first team");
    QUnit.equal(res.getPoints(1), pa, "points of second team");

    QUnit.equal(res.getNetto(), pa - pb, "netto points");
  });
});

/*
 * NettoRanking test
 */
require([ 'result', 'nettoranking' ], function (Result, Netto) {
  QUnit.test("NettoRanking", function () {
    var resa, resb, ranking, tmp;

    ranking = new Netto(5);
    QUnit.equal(ranking.size(), 5, "size test");

    resa = new Result(1, 3, 5, 13);
    resb = new Result([ 0, 1 ], [ 2, 4 ], 11, 0);
    ranking.add(resa).add(resb);

    tmp = {
      netto : [ 11, 3, -11, 8, -11 ],
      ranking : [ 0, 3, 1, 2, 4 ],
      size : 5,
      wins : [ 1, 1, 0, 1, 0 ],
    };
    QUnit.deepEqual(ranking.get(), tmp, "get() after add()");

    ranking.remove(resa);
    tmp = {
      netto : [ 11, 11, -11, 0, -11 ],
      size : 5,
      ranking : [ 0, 1, 3, 2, 4 ],
      wins : [ 1, 1, 0, 0, 0 ],
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after remove()");

    resb = new Result(2, 3, 13, 5);
    ranking.add(resa);
    ranking.correct(resa, resb);

    tmp = {
      netto : [ 11, 11, -3, -8, -11 ],
      ranking : [ 0, 1, 2, 3, 4 ],
      size : 5,
      wins : [ 1, 1, 1, 0, 0 ]
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after correct()");

    ranking.resize(2);
    ranking.resize(5);

    tmp = {
      netto : [ 11, 11, 0, 0, 0 ],
      ranking : [ 0, 1, 2, 3, 4 ],
      size : 5,
      wins : [ 1, 1, 0, 0, 0 ]
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after resize()");
  });
});

/*
 * BuchholzRanking test
 */
require([ 'result', 'buchholzranking' ], function (Result, Buchholz) {
  QUnit.test("BuchholzRanking", function () {
    var resa, resb, resc, ranking, tmp, i;

    ranking = new Buchholz(5);
    QUnit.equal(ranking.size(), 5, "size test");

    resa = new Result(1, 2, 0, 13);
    resb = new Result(2, 3, 13, 3);
    resc = new Result(1, 4, 13, 10);
    ranking.add(resa).add(resb).add(resc);

    tmp = {
      buchholz : [ 0, 2, 1, 2, 1 ],
      netto : [ 0, -10, 23, -10, -3 ],
      ranking : [ 2, 1, 3, 4, 0 ],
      size : 5,
      wins : [ 0, 1, 2, 0, 0 ]
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after add()");

    ranking.remove(resb);

    tmp = {
      buchholz : [ 0, 1, 1, 0, 1 ],
      netto : [ 0, -10, 13, 0, -3 ],
      ranking : [ 2, 1, 4, 0, 3 ],
      size : 5,
      wins : [ 0, 1, 1, 0, 0 ]
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after remove()");

    ranking.add(resb);
    tmp = new Result(2, 0, 13, 5);
    ranking.correct(resb, tmp);

    tmp = {
      buchholz : [ 2, 2, 1, 0, 1 ],
      netto : [ -8, -10, 21, 0, -3 ],
      ranking : [ 2, 1, 0, 4, 3 ],
      size : 5,
      wins : [ 0, 1, 2, 0, 0 ]
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after correct()");

    ranking.resize(3);
    ranking.resize(5);

    tmp = {
      buchholz : [ 2, 2, 1, 0, 0 ],
      netto : [ -8, -10, 21, 0, 0 ],
      ranking : [ 2, 1, 0, 3, 4 ],
      size : 5,
      wins : [ 0, 1, 2, 0, 0 ]
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after resize()");
  });
});

/*
 * Finebuchholz test
 */
require([ 'result', 'finebuchholzranking' ], function (Result, Finebuchholz) {
  QUnit.test("Finebuchholz", function () {
    var resa, resb, resc, ranking, tmp, i;

    ranking = new Finebuchholz(5);
    QUnit.equal(ranking.size(), 5, "size test");

    resa = new Result(1, 2, 0, 13);
    resb = new Result(2, 3, 13, 3);
    resc = new Result(1, 4, 13, 10);
    ranking.add(resa).add(resb).add(resc);

    tmp = {
      buchholz : [ 0, 2, 1, 2, 1 ],
      finebuchholz : [ 0, 2, 4, 1, 2 ],
      netto : [ 0, -10, 23, -10, -3 ],
      ranking : [ 2, 1, 3, 4, 0 ],
      size : 5,
      wins : [ 0, 1, 2, 0, 0 ]
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after add()");

    ranking.remove(resb);

    tmp = {
      buchholz : [ 0, 1, 1, 0, 1 ],
      finebuchholz : [ 0, 2, 1, 0, 1 ],
      netto : [ 0, -10, 13, 0, -3 ],
      ranking : [ 1, 2, 4, 0, 3 ],
      size : 5,
      wins : [ 0, 1, 1, 0, 0 ]
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after remove()");

    ranking.add(resb);
    tmp = new Result(2, 0, 13, 5);
    ranking.correct(resb, tmp);

    tmp = {
      buchholz : [ 2, 2, 1, 0, 1 ],
      finebuchholz : [ 1, 2, 4, 0, 2 ],
      netto : [ -8, -10, 21, 0, -3 ],
      ranking : [ 2, 1, 0, 4, 3 ],
      size : 5,
      wins : [ 0, 1, 2, 0, 0 ]
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after correct()");

    ranking.resize(3);
    ranking.resize(5);

    tmp = {
      buchholz : [ 2, 2, 1, 0, 0 ],
      finebuchholz : [ 1, 1, 4, 0, 0 ],
      netto : [ -8, -10, 21, 0, 0 ],
      ranking : [ 2, 1, 0, 3, 4 ],
      size : 5,
      wins : [ 0, 1, 2, 0, 0 ]
    };

    QUnit.deepEqual(ranking.get(), tmp, "get() after resize()");
  });
});