/**
 * PositiveMatrix: return only positive values
 *
 * @return PositiveMatrix
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(['lib/extend', './delegatematrix'], function(extend, DelegateMatrix) {
  /**
   * Constructor
   */
  function PositiveMatrix(matrix) {
    PositiveMatrix.superconstructor.call(this, matrix);
  }
  extend(PositiveMatrix, DelegateMatrix);

  /**
   * return only positive values
   *
   * @param row
   *          the row
   * @param col
   *          the column
   * @return 0 if the actual value is negative, the value otherwise. undefined
   *          on error
   */
  PositiveMatrix.prototype.get = function(row, col) {
    var value = this.superget(row, col);
    if (value < 0) {
      return 0;
    }
    return value;
  };

  return PositiveMatrix;
});