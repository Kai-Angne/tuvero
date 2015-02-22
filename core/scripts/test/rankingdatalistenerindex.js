/**
 * RankingDataListenerIndex class tests
 *
 * @return RankingDataListenerIndex
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */

define(function() {
  return function(QUnit, getModule) {
    var RankingDataListenerIndex, Emitter, extend;

    RankingDataListenerIndex = getModule('core/rankingdatalistenerindex');
    Emitter = getModule('core/emitter');

    QUnit.test('RankingDataListenerIndex', function() {
      var names, listeners, dummyRanking, result;

      dummyRanking = new Emitter();
      dummyRanking.size = 5;
      dummyRanking.EVENTS = {
        'insert': true
      };

      names = [];
      listeners = RankingDataListenerIndex.registerDataListeners(names,
          dummyRanking);
      QUnit.deepEqual(names, [], 'empty names: still valid input');
      QUnit.deepEqual(listeners, [], 'empty names: no listeners');

      names = ['points'];
      listeners = RankingDataListenerIndex.registerDataListeners(names,
          dummyRanking);
      QUnit.deepEqual(names, ['points'], 'flat dependencies: valid names out');
      QUnit.deepEqual(listeners.length, 1, 'flat dependencies: one listener');
      QUnit.ok(dummyRanking.points, 'listener creates points field');
      QUnit.equal(dummyRanking.points.length, dummyRanking.size,
          'listener initializes points field size');
      QUnit.equal(dummyRanking.points, listeners[0].points,
          'dummyRanking and listener share the reference');

      result = {
        player: [1, 4],
        points: [13, 7]
      };
      dummyRanking.emit('insert', result);

      ref = [0, 13, 0, 0, 7];
      QUnit.deepEqual(dummyRanking.points.asArray(), ref,
          'single result accepted');

      result = {
        player: [0, 1],
        points: [5, 11]
      };
      dummyRanking.emit('insert', result);
      result = {
        player: [3, 2],
        points: [13, 0]
      };
      dummyRanking.emit('insert', result);

      ref = [5, 24, 0, 13, 7];
      QUnit.deepEqual(dummyRanking.points.asArray(), ref,
          'multiple results work');

      /*
       * Note to self: further input/result validation should be performed in
       * individual tests, for every dummyRanking component.
       */

      dummyRanking = new Emitter();
      dummyRanking.size = 5;
      names = ['saldo'];
      listeners = RankingDataListenerIndex.registerDataListeners(names,
          dummyRanking);
      QUnit.deepEqual(names, ['points', 'lostpoints', 'saldo'],
          'hidden dependencies: valid names and name order');
      QUnit.deepEqual(listeners.length, 3,
          'hidden dependencies: additional listeners');
      QUnit.ok(dummyRanking.points, 'listener creates points field');
      QUnit.ok(dummyRanking.lostpoints, 'listener creates lostpoints field');
      QUnit.ok(dummyRanking.saldo, 'listener creates saldo field');

      dummyRanking = new Emitter();
      dummyRanking.size = 5;
      names = ['points', 'lostpoints', 'points'];
      listeners = RankingDataListenerIndex.registerDataListeners(names,
          dummyRanking);
      QUnit.deepEqual(names, ['points', 'lostpoints'],
          'duplicate dependencies: removing duplicates');
      QUnit.deepEqual(listeners.length, 2,
          'hidden dependencies: additional listeners');

      dummyRanking = new Emitter();
      dummyRanking.size = 5;
      names = ['points', 'wtfisthis', 'saldo'];
      listeners = RankingDataListenerIndex.registerDataListeners(names,
          dummyRanking);
      QUnit.equal(listeners, undefined, 'undefined name -> abort');
      QUnit.deepEqual(names, ['wtfisthis'],
          'undefined name -> names array contains undefined entries');
    });
  };
});