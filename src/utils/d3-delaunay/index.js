/**
 * @notice
 * This product includes code that is adapted d3-delaunay@5.2.1,
 * which is available under a "ISC" license.
 *
 * Copyright 2018 Observable, Inc.
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */

"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e3) { throw _e3; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e4) { didErr = true; err = _e4; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// https://github.com/d3/d3-delaunay v5.2.1 Copyright 2020 Mike Bostock
// https://github.com/mapbox/delaunator v4.0.1. Copyright 2019 Mapbox, Inc.

(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (global = global || self, factory(global.d3 = global.d3 || {}));
})(void 0, function (exports) {
  'use strict';

  var _marked = /*#__PURE__*/regeneratorRuntime.mark(flatIterable);

  var EPSILON = Math.pow(2, -52);
  var EDGE_STACK = new Uint32Array(512);

  var Delaunator = /*#__PURE__*/function () {
    _createClass(Delaunator, null, [{
      key: "from",
      value: function from(points) {
        var getX = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultGetX;
        var getY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultGetY;
        var n = points.length;
        var coords = new Float64Array(n * 2);

        for (var i = 0; i < n; i++) {
          var p = points[i];
          coords[2 * i] = getX(p);
          coords[2 * i + 1] = getY(p);
        }

        return new Delaunator(coords);
      }
    }]);

    function Delaunator(coords) {
      _classCallCheck(this, Delaunator);

      var n = coords.length >> 1;
      if (n > 0 && typeof coords[0] !== 'number') throw new Error('Expected coords to contain numbers.');
      this.coords = coords; // arrays that will store the triangulation graph

      var maxTriangles = Math.max(2 * n - 5, 0);
      this._triangles = new Uint32Array(maxTriangles * 3);
      this._halfedges = new Int32Array(maxTriangles * 3); // temporary arrays for tracking the edges of the advancing convex hull

      this._hashSize = Math.ceil(Math.sqrt(n));
      this._hullPrev = new Uint32Array(n); // edge to prev edge

      this._hullNext = new Uint32Array(n); // edge to next edge

      this._hullTri = new Uint32Array(n); // edge to adjacent triangle

      this._hullHash = new Int32Array(this._hashSize).fill(-1); // angular edge hash
      // temporary arrays for sorting points

      this._ids = new Uint32Array(n);
      this._dists = new Float64Array(n);
      this.update();
    }

    _createClass(Delaunator, [{
      key: "update",
      value: function update() {
        var coords = this.coords,
            hullPrev = this._hullPrev,
            hullNext = this._hullNext,
            hullTri = this._hullTri,
            hullHash = this._hullHash;
        var n = coords.length >> 1; // populate an array of point indices; calculate input data bbox

        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;

        for (var i = 0; i < n; i++) {
          var x = coords[2 * i];
          var y = coords[2 * i + 1];
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
          this._ids[i] = i;
        }

        var cx = (minX + maxX) / 2;
        var cy = (minY + maxY) / 2;
        var minDist = Infinity;
        var i0, i1, i2; // pick a seed point close to the center

        for (var _i = 0; _i < n; _i++) {
          var d = dist(cx, cy, coords[2 * _i], coords[2 * _i + 1]);

          if (d < minDist) {
            i0 = _i;
            minDist = d;
          }
        }

        var i0x = coords[2 * i0];
        var i0y = coords[2 * i0 + 1];
        minDist = Infinity; // find the point closest to the seed

        for (var _i2 = 0; _i2 < n; _i2++) {
          if (_i2 === i0) continue;

          var _d = dist(i0x, i0y, coords[2 * _i2], coords[2 * _i2 + 1]);

          if (_d < minDist && _d > 0) {
            i1 = _i2;
            minDist = _d;
          }
        }

        var i1x = coords[2 * i1];
        var i1y = coords[2 * i1 + 1];
        var minRadius = Infinity; // find the third point which forms the smallest circumcircle with the first two

        for (var _i3 = 0; _i3 < n; _i3++) {
          if (_i3 === i0 || _i3 === i1) continue;
          var r = circumradius(i0x, i0y, i1x, i1y, coords[2 * _i3], coords[2 * _i3 + 1]);

          if (r < minRadius) {
            i2 = _i3;
            minRadius = r;
          }
        }

        var i2x = coords[2 * i2];
        var i2y = coords[2 * i2 + 1];

        if (minRadius === Infinity) {
          // order collinear points by dx (or dy if all x are identical)
          // and return the list as a hull
          for (var _i4 = 0; _i4 < n; _i4++) {
            this._dists[_i4] = coords[2 * _i4] - coords[0] || coords[2 * _i4 + 1] - coords[1];
          }

          quicksort(this._ids, this._dists, 0, n - 1);
          var hull = new Uint32Array(n);
          var j = 0;

          for (var _i5 = 0, d0 = -Infinity; _i5 < n; _i5++) {
            var id = this._ids[_i5];

            if (this._dists[id] > d0) {
              hull[j++] = id;
              d0 = this._dists[id];
            }
          }

          this.hull = hull.subarray(0, j);
          this.triangles = new Uint32Array(0);
          this.halfedges = new Uint32Array(0);
          return;
        } // swap the order of the seed points for counter-clockwise orientation


        if (orient(i0x, i0y, i1x, i1y, i2x, i2y)) {
          var _i6 = i1;
          var _x = i1x;
          var _y = i1y;
          i1 = i2;
          i1x = i2x;
          i1y = i2y;
          i2 = _i6;
          i2x = _x;
          i2y = _y;
        }

        var center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
        this._cx = center.x;
        this._cy = center.y;

        for (var _i7 = 0; _i7 < n; _i7++) {
          this._dists[_i7] = dist(coords[2 * _i7], coords[2 * _i7 + 1], center.x, center.y);
        } // sort the points by distance from the seed triangle circumcenter


        quicksort(this._ids, this._dists, 0, n - 1); // set up the seed triangle as the starting hull

        this._hullStart = i0;
        var hullSize = 3;
        hullNext[i0] = hullPrev[i2] = i1;
        hullNext[i1] = hullPrev[i0] = i2;
        hullNext[i2] = hullPrev[i1] = i0;
        hullTri[i0] = 0;
        hullTri[i1] = 1;
        hullTri[i2] = 2;
        hullHash.fill(-1);
        hullHash[this._hashKey(i0x, i0y)] = i0;
        hullHash[this._hashKey(i1x, i1y)] = i1;
        hullHash[this._hashKey(i2x, i2y)] = i2;
        this.trianglesLen = 0;

        this._addTriangle(i0, i1, i2, -1, -1, -1);

        for (var k = 0, xp, yp; k < this._ids.length; k++) {
          var _i8 = this._ids[k];
          var _x2 = coords[2 * _i8];
          var _y2 = coords[2 * _i8 + 1]; // skip near-duplicate points

          if (k > 0 && Math.abs(_x2 - xp) <= EPSILON && Math.abs(_y2 - yp) <= EPSILON) continue;
          xp = _x2;
          yp = _y2; // skip seed triangle points

          if (_i8 === i0 || _i8 === i1 || _i8 === i2) continue; // find a visible edge on the convex hull using edge hash

          var start = 0;

          for (var _j = 0, key = this._hashKey(_x2, _y2); _j < this._hashSize; _j++) {
            start = hullHash[(key + _j) % this._hashSize];
            if (start !== -1 && start !== hullNext[start]) break;
          }

          start = hullPrev[start];
          var e = start,
              q = void 0;

          while (q = hullNext[e], !orient(_x2, _y2, coords[2 * e], coords[2 * e + 1], coords[2 * q], coords[2 * q + 1])) {
            e = q;

            if (e === start) {
              e = -1;
              break;
            }
          }

          if (e === -1) continue; // likely a near-duplicate point; skip it
          // add the first triangle from the point

          var t = this._addTriangle(e, _i8, hullNext[e], -1, -1, hullTri[e]); // recursively flip triangles from the point until they satisfy the Delaunay condition


          hullTri[_i8] = this._legalize(t + 2);
          hullTri[e] = t; // keep track of boundary triangles on the hull

          hullSize++; // walk forward through the hull, adding more triangles and flipping recursively

          var _n = hullNext[e];

          while (q = hullNext[_n], orient(_x2, _y2, coords[2 * _n], coords[2 * _n + 1], coords[2 * q], coords[2 * q + 1])) {
            t = this._addTriangle(_n, _i8, q, hullTri[_i8], -1, hullTri[_n]);
            hullTri[_i8] = this._legalize(t + 2);
            hullNext[_n] = _n; // mark as removed

            hullSize--;
            _n = q;
          } // walk backward from the other side, adding more triangles and flipping


          if (e === start) {
            while (q = hullPrev[e], orient(_x2, _y2, coords[2 * q], coords[2 * q + 1], coords[2 * e], coords[2 * e + 1])) {
              t = this._addTriangle(q, _i8, e, -1, hullTri[e], hullTri[q]);

              this._legalize(t + 2);

              hullTri[q] = t;
              hullNext[e] = e; // mark as removed

              hullSize--;
              e = q;
            }
          } // update the hull indices


          this._hullStart = hullPrev[_i8] = e;
          hullNext[e] = hullPrev[_n] = _i8;
          hullNext[_i8] = _n; // save the two new edges in the hash table

          hullHash[this._hashKey(_x2, _y2)] = _i8;
          hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
        }

        this.hull = new Uint32Array(hullSize);

        for (var _i9 = 0, _e = this._hullStart; _i9 < hullSize; _i9++) {
          this.hull[_i9] = _e;
          _e = hullNext[_e];
        } // trim typed triangle mesh arrays


        this.triangles = this._triangles.subarray(0, this.trianglesLen);
        this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
      }
    }, {
      key: "_hashKey",
      value: function _hashKey(x, y) {
        return Math.floor(pseudoAngle(x - this._cx, y - this._cy) * this._hashSize) % this._hashSize;
      }
    }, {
      key: "_legalize",
      value: function _legalize(a) {
        var triangles = this._triangles,
            halfedges = this._halfedges,
            coords = this.coords;
        var i = 0;
        var ar = 0; // recursion eliminated with a fixed-size stack

        while (true) {
          var b = halfedges[a];
          /* if the pair of triangles doesn't satisfy the Delaunay condition
           * (p1 is inside the circumcircle of [p0, pl, pr]), flip them,
           * then do the same check/flip recursively for the new pair of triangles
           *
           *           pl                    pl
           *          /||\                  /  \
           *       al/ || \bl            al/    \a
           *        /  ||  \              /      \
           *       /  a||b  \    flip    /___ar___\
           *     p0\   ||   /p1   =>   p0\---bl---/p1
           *        \  ||  /              \      /
           *       ar\ || /br             b\    /br
           *          \||/                  \  /
           *           pr                    pr
           */

          var a0 = a - a % 3;
          ar = a0 + (a + 2) % 3;

          if (b === -1) {
            // convex hull edge
            if (i === 0) break;
            a = EDGE_STACK[--i];
            continue;
          }

          var b0 = b - b % 3;
          var al = a0 + (a + 1) % 3;
          var bl = b0 + (b + 2) % 3;
          var p0 = triangles[ar];
          var pr = triangles[a];
          var pl = triangles[al];
          var p1 = triangles[bl];
          var illegal = inCircle(coords[2 * p0], coords[2 * p0 + 1], coords[2 * pr], coords[2 * pr + 1], coords[2 * pl], coords[2 * pl + 1], coords[2 * p1], coords[2 * p1 + 1]);

          if (illegal) {
            triangles[a] = p1;
            triangles[b] = p0;
            var hbl = halfedges[bl]; // edge swapped on the other side of the hull (rare); fix the halfedge reference

            if (hbl === -1) {
              var e = this._hullStart;

              do {
                if (this._hullTri[e] === bl) {
                  this._hullTri[e] = a;
                  break;
                }

                e = this._hullPrev[e];
              } while (e !== this._hullStart);
            }

            this._link(a, hbl);

            this._link(b, halfedges[ar]);

            this._link(ar, bl);

            var br = b0 + (b + 1) % 3; // don't worry about hitting the cap: it can only happen on extremely degenerate input

            if (i < EDGE_STACK.length) {
              EDGE_STACK[i++] = br;
            }
          } else {
            if (i === 0) break;
            a = EDGE_STACK[--i];
          }
        }

        return ar;
      }
    }, {
      key: "_link",
      value: function _link(a, b) {
        this._halfedges[a] = b;
        if (b !== -1) this._halfedges[b] = a;
      } // add a new triangle given vertex indices and adjacent half-edge ids

    }, {
      key: "_addTriangle",
      value: function _addTriangle(i0, i1, i2, a, b, c) {
        var t = this.trianglesLen;
        this._triangles[t] = i0;
        this._triangles[t + 1] = i1;
        this._triangles[t + 2] = i2;

        this._link(t, a);

        this._link(t + 1, b);

        this._link(t + 2, c);

        this.trianglesLen += 3;
        return t;
      }
    }]);

    return Delaunator;
  }(); // monotonically increases with real angle, but doesn't need expensive trigonometry


  function pseudoAngle(dx, dy) {
    var p = dx / (Math.abs(dx) + Math.abs(dy));
    return (dy > 0 ? 3 - p : 1 + p) / 4; // [0..1]
  }

  function dist(ax, ay, bx, by) {
    var dx = ax - bx;
    var dy = ay - by;
    return dx * dx + dy * dy;
  } // return 2d orientation sign if we're confident in it through J. Shewchuk's error bound check


  function orientIfSure(px, py, rx, ry, qx, qy) {
    var l = (ry - py) * (qx - px);
    var r = (rx - px) * (qy - py);
    return Math.abs(l - r) >= 3.3306690738754716e-16 * Math.abs(l + r) ? l - r : 0;
  } // a more robust orientation test that's stable in a given triangle (to fix robustness issues)


  function orient(rx, ry, qx, qy, px, py) {
    var sign = orientIfSure(px, py, rx, ry, qx, qy) || orientIfSure(rx, ry, qx, qy, px, py) || orientIfSure(qx, qy, px, py, rx, ry);
    return sign < 0;
  }

  function inCircle(ax, ay, bx, by, cx, cy, px, py) {
    var dx = ax - px;
    var dy = ay - py;
    var ex = bx - px;
    var ey = by - py;
    var fx = cx - px;
    var fy = cy - py;
    var ap = dx * dx + dy * dy;
    var bp = ex * ex + ey * ey;
    var cp = fx * fx + fy * fy;
    return dx * (ey * cp - bp * fy) - dy * (ex * cp - bp * fx) + ap * (ex * fy - ey * fx) < 0;
  }

  function circumradius(ax, ay, bx, by, cx, cy) {
    var dx = bx - ax;
    var dy = by - ay;
    var ex = cx - ax;
    var ey = cy - ay;
    var bl = dx * dx + dy * dy;
    var cl = ex * ex + ey * ey;
    var d = 0.5 / (dx * ey - dy * ex);
    var x = (ey * bl - dy * cl) * d;
    var y = (dx * cl - ex * bl) * d;
    return x * x + y * y;
  }

  function circumcenter(ax, ay, bx, by, cx, cy) {
    var dx = bx - ax;
    var dy = by - ay;
    var ex = cx - ax;
    var ey = cy - ay;
    var bl = dx * dx + dy * dy;
    var cl = ex * ex + ey * ey;
    var d = 0.5 / (dx * ey - dy * ex);
    var x = ax + (ey * bl - dy * cl) * d;
    var y = ay + (dx * cl - ex * bl) * d;
    return {
      x: x,
      y: y
    };
  }

  function quicksort(ids, dists, left, right) {
    if (right - left <= 20) {
      for (var i = left + 1; i <= right; i++) {
        var temp = ids[i];
        var tempDist = dists[temp];
        var j = i - 1;

        while (j >= left && dists[ids[j]] > tempDist) {
          ids[j + 1] = ids[j--];
        }

        ids[j + 1] = temp;
      }
    } else {
      var median = left + right >> 1;

      var _i10 = left + 1;

      var _j2 = right;
      swap(ids, median, _i10);
      if (dists[ids[left]] > dists[ids[right]]) swap(ids, left, right);
      if (dists[ids[_i10]] > dists[ids[right]]) swap(ids, _i10, right);
      if (dists[ids[left]] > dists[ids[_i10]]) swap(ids, left, _i10);
      var _temp = ids[_i10];
      var _tempDist = dists[_temp];

      while (true) {
        do {
          _i10++;
        } while (dists[ids[_i10]] < _tempDist);

        do {
          _j2--;
        } while (dists[ids[_j2]] > _tempDist);

        if (_j2 < _i10) break;
        swap(ids, _i10, _j2);
      }

      ids[left + 1] = ids[_j2];
      ids[_j2] = _temp;

      if (right - _i10 + 1 >= _j2 - left) {
        quicksort(ids, dists, _i10, right);
        quicksort(ids, dists, left, _j2 - 1);
      } else {
        quicksort(ids, dists, left, _j2 - 1);
        quicksort(ids, dists, _i10, right);
      }
    }
  }

  function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }

  function defaultGetX(p) {
    return p[0];
  }

  function defaultGetY(p) {
    return p[1];
  }

  var epsilon = 1e-6;

  var Path = /*#__PURE__*/function () {
    function Path() {
      _classCallCheck(this, Path);

      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath

      this._ = "";
    }

    _createClass(Path, [{
      key: "moveTo",
      value: function moveTo(x, y) {
        this._ += "M".concat(this._x0 = this._x1 = +x, ",").concat(this._y0 = this._y1 = +y);
      }
    }, {
      key: "closePath",
      value: function closePath() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      }
    }, {
      key: "lineTo",
      value: function lineTo(x, y) {
        this._ += "L".concat(this._x1 = +x, ",").concat(this._y1 = +y);
      }
    }, {
      key: "arc",
      value: function arc(x, y, r) {
        x = +x, y = +y, r = +r;
        var x0 = x + r;
        var y0 = y;
        if (r < 0) throw new Error("negative radius");
        if (this._x1 === null) this._ += "M".concat(x0, ",").concat(y0);else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) this._ += "L" + x0 + "," + y0;
        if (!r) return;
        this._ += "A".concat(r, ",").concat(r, ",0,1,1,").concat(x - r, ",").concat(y, "A").concat(r, ",").concat(r, ",0,1,1,").concat(this._x1 = x0, ",").concat(this._y1 = y0);
      }
    }, {
      key: "rect",
      value: function rect(x, y, w, h) {
        this._ += "M".concat(this._x0 = this._x1 = +x, ",").concat(this._y0 = this._y1 = +y, "h").concat(+w, "v").concat(+h, "h").concat(-w, "Z");
      }
    }, {
      key: "value",
      value: function value() {
        return this._ || null;
      }
    }]);

    return Path;
  }();

  var Polygon = /*#__PURE__*/function () {
    function Polygon() {
      _classCallCheck(this, Polygon);

      this._ = [];
    }

    _createClass(Polygon, [{
      key: "moveTo",
      value: function moveTo(x, y) {
        this._.push([x, y]);
      }
    }, {
      key: "closePath",
      value: function closePath() {
        this._.push(this._[0].slice());
      }
    }, {
      key: "lineTo",
      value: function lineTo(x, y) {
        this._.push([x, y]);
      }
    }, {
      key: "value",
      value: function value() {
        return this._.length ? this._ : null;
      }
    }]);

    return Polygon;
  }();

  var Voronoi = /*#__PURE__*/function () {
    function Voronoi(delaunay) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 960, 500],
          _ref2 = _slicedToArray(_ref, 4),
          xmin = _ref2[0],
          ymin = _ref2[1],
          xmax = _ref2[2],
          ymax = _ref2[3];

      _classCallCheck(this, Voronoi);

      if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin))) throw new Error("invalid bounds");
      this.delaunay = delaunay;
      this._circumcenters = new Float64Array(delaunay.points.length * 2);
      this.vectors = new Float64Array(delaunay.points.length * 2);
      this.xmax = xmax, this.xmin = xmin;
      this.ymax = ymax, this.ymin = ymin;

      this._init();
    }

    _createClass(Voronoi, [{
      key: "update",
      value: function update() {
        this.delaunay.update();

        this._init();

        return this;
      }
    }, {
      key: "_init",
      value: function _init() {
        var _this$delaunay = this.delaunay,
            points = _this$delaunay.points,
            hull = _this$delaunay.hull,
            triangles = _this$delaunay.triangles,
            vectors = this.vectors; // Compute circumcenters.

        var circumcenters = this.circumcenters = this._circumcenters.subarray(0, triangles.length / 3 * 2);

        for (var i = 0, j = 0, n = triangles.length, x, y; i < n; i += 3, j += 2) {
          var t1 = triangles[i] * 2;
          var t2 = triangles[i + 1] * 2;
          var t3 = triangles[i + 2] * 2;
          var _x3 = points[t1];
          var _y3 = points[t1 + 1];
          var x2 = points[t2];
          var y2 = points[t2 + 1];
          var x3 = points[t3];
          var y3 = points[t3 + 1];
          var dx = x2 - _x3;
          var dy = y2 - _y3;
          var ex = x3 - _x3;
          var ey = y3 - _y3;
          var bl = dx * dx + dy * dy;
          var cl = ex * ex + ey * ey;
          var ab = (dx * ey - dy * ex) * 2;

          if (!ab) {
            // degenerate case (collinear diagram)
            x = (_x3 + x3) / 2 - 1e8 * ey;
            y = (_y3 + y3) / 2 + 1e8 * ex;
          } else if (Math.abs(ab) < 1e-8) {
            // almost equal points (degenerate triangle)
            x = (_x3 + x3) / 2;
            y = (_y3 + y3) / 2;
          } else {
            var d = 1 / ab;
            x = _x3 + (ey * bl - dy * cl) * d;
            y = _y3 + (dx * cl - ex * bl) * d;
          }

          circumcenters[j] = x;
          circumcenters[j + 1] = y;
        } // Compute exterior cell rays.


        var h = hull[hull.length - 1];
        var p0,
            p1 = h * 4;
        var x0,
            x1 = points[2 * h];
        var y0,
            y1 = points[2 * h + 1];
        vectors.fill(0);

        for (var _i11 = 0; _i11 < hull.length; ++_i11) {
          h = hull[_i11];
          p0 = p1, x0 = x1, y0 = y1;
          p1 = h * 4, x1 = points[2 * h], y1 = points[2 * h + 1];
          vectors[p0 + 2] = vectors[p1] = y0 - y1;
          vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
        }
      }
    }, {
      key: "render",
      value: function render(context) {
        var buffer = context == null ? context = new Path() : undefined;
        var _this$delaunay2 = this.delaunay,
            halfedges = _this$delaunay2.halfedges,
            inedges = _this$delaunay2.inedges,
            hull = _this$delaunay2.hull,
            circumcenters = this.circumcenters,
            vectors = this.vectors;
        if (hull.length <= 1) return null;

        for (var i = 0, n = halfedges.length; i < n; ++i) {
          var j = halfedges[i];
          if (j < i) continue;
          var ti = Math.floor(i / 3) * 2;
          var tj = Math.floor(j / 3) * 2;
          var xi = circumcenters[ti];
          var yi = circumcenters[ti + 1];
          var xj = circumcenters[tj];
          var yj = circumcenters[tj + 1];

          this._renderSegment(xi, yi, xj, yj, context);
        }

        var h0,
            h1 = hull[hull.length - 1];

        for (var _i12 = 0; _i12 < hull.length; ++_i12) {
          h0 = h1, h1 = hull[_i12];
          var t = Math.floor(inedges[h1] / 3) * 2;
          var x = circumcenters[t];
          var y = circumcenters[t + 1];
          var v = h0 * 4;

          var p = this._project(x, y, vectors[v + 2], vectors[v + 3]);

          if (p) this._renderSegment(x, y, p[0], p[1], context);
        }

        return buffer && buffer.value();
      }
    }, {
      key: "renderBounds",
      value: function renderBounds(context) {
        var buffer = context == null ? context = new Path() : undefined;
        context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
        return buffer && buffer.value();
      }
    }, {
      key: "renderCell",
      value: function renderCell(i, context) {
        var buffer = context == null ? context = new Path() : undefined;

        var points = this._clip(i);

        if (points === null) return;
        context.moveTo(points[0], points[1]);
        var n = points.length;

        while (points[0] === points[n - 2] && points[1] === points[n - 1] && n > 1) {
          n -= 2;
        }

        for (var _i13 = 2; _i13 < n; _i13 += 2) {
          if (points[_i13] !== points[_i13 - 2] || points[_i13 + 1] !== points[_i13 - 1]) context.lineTo(points[_i13], points[_i13 + 1]);
        }

        context.closePath();
        return buffer && buffer.value();
      }
    }, {
      key: "cellPolygons",
      value: /*#__PURE__*/regeneratorRuntime.mark(function cellPolygons() {
        var points, i, n, cell;
        return regeneratorRuntime.wrap(function cellPolygons$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                points = this.delaunay.points;
                i = 0, n = points.length / 2;

              case 2:
                if (!(i < n)) {
                  _context.next = 10;
                  break;
                }

                cell = this.cellPolygon(i);

                if (!cell) {
                  _context.next = 7;
                  break;
                }

                _context.next = 7;
                return cell;

              case 7:
                ++i;
                _context.next = 2;
                break;

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, cellPolygons, this);
      })
    }, {
      key: "cellPolygon",
      value: function cellPolygon(i) {
        var polygon = new Polygon();
        this.renderCell(i, polygon);
        return polygon.value();
      }
    }, {
      key: "_renderSegment",
      value: function _renderSegment(x0, y0, x1, y1, context) {
        var S;

        var c0 = this._regioncode(x0, y0);

        var c1 = this._regioncode(x1, y1);

        if (c0 === 0 && c1 === 0) {
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
        } else if (S = this._clipSegment(x0, y0, x1, y1, c0, c1)) {
          context.moveTo(S[0], S[1]);
          context.lineTo(S[2], S[3]);
        }
      }
    }, {
      key: "contains",
      value: function contains(i, x, y) {
        if ((x = +x, x !== x) || (y = +y, y !== y)) return false;
        return this.delaunay._step(i, x, y) === i;
      }
    }, {
      key: "neighbors",
      value: /*#__PURE__*/regeneratorRuntime.mark(function neighbors(i) {
        var ci, _iterator, _step, j, cj, ai, li, aj, lj;

        return regeneratorRuntime.wrap(function neighbors$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                ci = this._clip(i);

                if (!ci) {
                  _context2.next = 33;
                  break;
                }

                _iterator = _createForOfIteratorHelper(this.delaunay.neighbors(i));
                _context2.prev = 3;

                _iterator.s();

              case 5:
                if ((_step = _iterator.n()).done) {
                  _context2.next = 25;
                  break;
                }

                j = _step.value;
                cj = this._clip(j); // find the common edge

                if (!cj) {
                  _context2.next = 23;
                  break;
                }

                ai = 0, li = ci.length;

              case 10:
                if (!(ai < li)) {
                  _context2.next = 23;
                  break;
                }

                aj = 0, lj = cj.length;

              case 12:
                if (!(aj < lj)) {
                  _context2.next = 20;
                  break;
                }

                if (!(ci[ai] == cj[aj] && ci[ai + 1] == cj[aj + 1] && ci[(ai + 2) % li] == cj[(aj + lj - 2) % lj] && ci[(ai + 3) % li] == cj[(aj + lj - 1) % lj])) {
                  _context2.next = 17;
                  break;
                }

                _context2.next = 16;
                return j;

              case 16:
                return _context2.abrupt("break", 23);

              case 17:
                aj += 2;
                _context2.next = 12;
                break;

              case 20:
                ai += 2;
                _context2.next = 10;
                break;

              case 23:
                _context2.next = 5;
                break;

              case 25:
                _context2.next = 30;
                break;

              case 27:
                _context2.prev = 27;
                _context2.t0 = _context2["catch"](3);

                _iterator.e(_context2.t0);

              case 30:
                _context2.prev = 30;

                _iterator.f();

                return _context2.finish(30);

              case 33:
              case "end":
                return _context2.stop();
            }
          }
        }, neighbors, this, [[3, 27, 30, 33]]);
      })
    }, {
      key: "_cell",
      value: function _cell(i) {
        var circumcenters = this.circumcenters,
            _this$delaunay3 = this.delaunay,
            inedges = _this$delaunay3.inedges,
            halfedges = _this$delaunay3.halfedges,
            triangles = _this$delaunay3.triangles;
        var e0 = inedges[i];
        if (e0 === -1) return null; // coincident point

        var points = [];
        var e = e0;

        do {
          var t = Math.floor(e / 3);
          points.push(circumcenters[t * 2], circumcenters[t * 2 + 1]);
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) break; // bad triangulation

          e = halfedges[e];
        } while (e !== e0 && e !== -1);

        return points;
      }
    }, {
      key: "_clip",
      value: function _clip(i) {
        // degenerate case (1 valid point: return the box)
        if (i === 0 && this.delaunay.hull.length === 1) {
          return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }

        var points = this._cell(i);

        if (points === null) return null;
        var V = this.vectors;
        var v = i * 4;
        return V[v] || V[v + 1] ? this._clipInfinite(i, points, V[v], V[v + 1], V[v + 2], V[v + 3]) : this._clipFinite(i, points);
      }
    }, {
      key: "_clipFinite",
      value: function _clipFinite(i, points) {
        var n = points.length;
        var P = null;
        var x0,
            y0,
            x1 = points[n - 2],
            y1 = points[n - 1];

        var c0,
            c1 = this._regioncode(x1, y1);

        var e0, e1;

        for (var j = 0; j < n; j += 2) {
          x0 = x1, y0 = y1, x1 = points[j], y1 = points[j + 1];
          c0 = c1, c1 = this._regioncode(x1, y1);

          if (c0 === 0 && c1 === 0) {
            e0 = e1, e1 = 0;
            if (P) P.push(x1, y1);else P = [x1, y1];
          } else {
            var S = void 0,
                sx0 = void 0,
                sy0 = void 0,
                sx1 = void 0,
                sy1 = void 0;

            if (c0 === 0) {
              if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null) continue;
              var _S = S;

              var _S2 = _slicedToArray(_S, 4);

              sx0 = _S2[0];
              sy0 = _S2[1];
              sx1 = _S2[2];
              sy1 = _S2[3];
            } else {
              if ((S = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null) continue;
              var _S3 = S;

              var _S4 = _slicedToArray(_S3, 4);

              sx1 = _S4[0];
              sy1 = _S4[1];
              sx0 = _S4[2];
              sy0 = _S4[3];
              e0 = e1, e1 = this._edgecode(sx0, sy0);
              if (e0 && e1) this._edge(i, e0, e1, P, P.length);
              if (P) P.push(sx0, sy0);else P = [sx0, sy0];
            }

            e0 = e1, e1 = this._edgecode(sx1, sy1);
            if (e0 && e1) this._edge(i, e0, e1, P, P.length);
            if (P) P.push(sx1, sy1);else P = [sx1, sy1];
          }
        }

        if (P) {
          e0 = e1, e1 = this._edgecode(P[0], P[1]);
          if (e0 && e1) this._edge(i, e0, e1, P, P.length);
        } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
          return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }

        return P;
      }
    }, {
      key: "_clipSegment",
      value: function _clipSegment(x0, y0, x1, y1, c0, c1) {
        while (true) {
          if (c0 === 0 && c1 === 0) return [x0, y0, x1, y1];
          if (c0 & c1) return null;
          var x = void 0,
              y = void 0,
              c = c0 || c1;
          if (c & 8) x = x0 + (x1 - x0) * (this.ymax - y0) / (y1 - y0), y = this.ymax;else if (c & 4) x = x0 + (x1 - x0) * (this.ymin - y0) / (y1 - y0), y = this.ymin;else if (c & 2) y = y0 + (y1 - y0) * (this.xmax - x0) / (x1 - x0), x = this.xmax;else y = y0 + (y1 - y0) * (this.xmin - x0) / (x1 - x0), x = this.xmin;
          if (c0) x0 = x, y0 = y, c0 = this._regioncode(x0, y0);else x1 = x, y1 = y, c1 = this._regioncode(x1, y1);
        }
      }
    }, {
      key: "_clipInfinite",
      value: function _clipInfinite(i, points, vx0, vy0, vxn, vyn) {
        var P = Array.from(points),
            p;
        if (p = this._project(P[0], P[1], vx0, vy0)) P.unshift(p[0], p[1]);
        if (p = this._project(P[P.length - 2], P[P.length - 1], vxn, vyn)) P.push(p[0], p[1]);

        if (P = this._clipFinite(i, P)) {
          for (var j = 0, n = P.length, c0, c1 = this._edgecode(P[n - 2], P[n - 1]); j < n; j += 2) {
            c0 = c1, c1 = this._edgecode(P[j], P[j + 1]);
            if (c0 && c1) j = this._edge(i, c0, c1, P, j), n = P.length;
          }
        } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
          P = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
        }

        return P;
      }
    }, {
      key: "_edge",
      value: function _edge(i, e0, e1, P, j) {
        while (e0 !== e1) {
          var x = void 0,
              y = void 0;

          switch (e0) {
            case 5:
              e0 = 4;
              continue;
            // top-left

            case 4:
              e0 = 6, x = this.xmax, y = this.ymin;
              break;
            // top

            case 6:
              e0 = 2;
              continue;
            // top-right

            case 2:
              e0 = 10, x = this.xmax, y = this.ymax;
              break;
            // right

            case 10:
              e0 = 8;
              continue;
            // bottom-right

            case 8:
              e0 = 9, x = this.xmin, y = this.ymax;
              break;
            // bottom

            case 9:
              e0 = 1;
              continue;
            // bottom-left

            case 1:
              e0 = 5, x = this.xmin, y = this.ymin;
              break;
            // left
          }

          if ((P[j] !== x || P[j + 1] !== y) && this.contains(i, x, y)) {
            P.splice(j, 0, x, y), j += 2;
          }
        }

        if (P.length > 4) {
          for (var _i14 = 0; _i14 < P.length; _i14 += 2) {
            var _j3 = (_i14 + 2) % P.length,
                k = (_i14 + 4) % P.length;

            if (P[_i14] === P[_j3] && P[_j3] === P[k] || P[_i14 + 1] === P[_j3 + 1] && P[_j3 + 1] === P[k + 1]) P.splice(_j3, 2), _i14 -= 2;
          }
        }

        return j;
      }
    }, {
      key: "_project",
      value: function _project(x0, y0, vx, vy) {
        var t = Infinity,
            c,
            x,
            y;

        if (vy < 0) {
          // top
          if (y0 <= this.ymin) return null;
          if ((c = (this.ymin - y0) / vy) < t) y = this.ymin, x = x0 + (t = c) * vx;
        } else if (vy > 0) {
          // bottom
          if (y0 >= this.ymax) return null;
          if ((c = (this.ymax - y0) / vy) < t) y = this.ymax, x = x0 + (t = c) * vx;
        }

        if (vx > 0) {
          // right
          if (x0 >= this.xmax) return null;
          if ((c = (this.xmax - x0) / vx) < t) x = this.xmax, y = y0 + (t = c) * vy;
        } else if (vx < 0) {
          // left
          if (x0 <= this.xmin) return null;
          if ((c = (this.xmin - x0) / vx) < t) x = this.xmin, y = y0 + (t = c) * vy;
        }

        return [x, y];
      }
    }, {
      key: "_edgecode",
      value: function _edgecode(x, y) {
        return (x === this.xmin ? 1 : x === this.xmax ? 2 : 0) | (y === this.ymin ? 4 : y === this.ymax ? 8 : 0);
      }
    }, {
      key: "_regioncode",
      value: function _regioncode(x, y) {
        return (x < this.xmin ? 1 : x > this.xmax ? 2 : 0) | (y < this.ymin ? 4 : y > this.ymax ? 8 : 0);
      }
    }]);

    return Voronoi;
  }();

  var tau = 2 * Math.PI;

  function pointX(p) {
    return p[0];
  }

  function pointY(p) {
    return p[1];
  } // A triangulation is collinear if all its triangles have a non-null area


  function collinear(d) {
    var triangles = d.triangles,
        coords = d.coords;

    for (var i = 0; i < triangles.length; i += 3) {
      var a = 2 * triangles[i],
          b = 2 * triangles[i + 1],
          c = 2 * triangles[i + 2],
          cross = (coords[c] - coords[a]) * (coords[b + 1] - coords[a + 1]) - (coords[b] - coords[a]) * (coords[c + 1] - coords[a + 1]);
      if (cross > 1e-10) return false;
    }

    return true;
  }

  function jitter(x, y, r) {
    return [x + Math.sin(x + y) * r, y + Math.cos(x - y) * r];
  }

  var Delaunay = /*#__PURE__*/function () {
    _createClass(Delaunay, null, [{
      key: "from",
      value: function from(points) {
        var fx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : pointX;
        var fy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : pointY;
        var that = arguments.length > 3 ? arguments[3] : undefined;
        return new Delaunay("length" in points ? flatArray(points, fx, fy, that) : Float64Array.from(flatIterable(points, fx, fy, that)));
      }
    }]);

    function Delaunay(points) {
      _classCallCheck(this, Delaunay);

      this._delaunator = new Delaunator(points);
      this.inedges = new Int32Array(points.length / 2);
      this._hullIndex = new Int32Array(points.length / 2);
      this.points = this._delaunator.coords;

      this._init();
    }

    _createClass(Delaunay, [{
      key: "update",
      value: function update() {
        this._delaunator.update();

        this._init();

        return this;
      }
    }, {
      key: "_init",
      value: function _init() {
        var d = this._delaunator,
            points = this.points; // check for collinear

        if (d.hull && d.hull.length > 2 && collinear(d)) {
          this.collinear = Int32Array.from({
            length: points.length / 2
          }, function (_, i) {
            return i;
          }).sort(function (i, j) {
            return points[2 * i] - points[2 * j] || points[2 * i + 1] - points[2 * j + 1];
          }); // for exact neighbors

          var e = this.collinear[0],
              f = this.collinear[this.collinear.length - 1],
              bounds = [points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1]],
              r = 1e-8 * Math.sqrt(Math.pow(bounds[3] - bounds[1], 2) + Math.pow(bounds[2] - bounds[0], 2));

          for (var i = 0, n = points.length / 2; i < n; ++i) {
            var p = jitter(points[2 * i], points[2 * i + 1], r);
            points[2 * i] = p[0];
            points[2 * i + 1] = p[1];
          }

          this._delaunator = new Delaunator(points);
        } else {
          delete this.collinear;
        }

        var halfedges = this.halfedges = this._delaunator.halfedges;
        var hull = this.hull = this._delaunator.hull;
        var triangles = this.triangles = this._delaunator.triangles;
        var inedges = this.inedges.fill(-1);

        var hullIndex = this._hullIndex.fill(-1); // Compute an index from each point to an (arbitrary) incoming halfedge
        // Used to give the first neighbor of each point; for this reason,
        // on the hull we give priority to exterior halfedges


        for (var _e2 = 0, _n2 = halfedges.length; _e2 < _n2; ++_e2) {
          var _p = triangles[_e2 % 3 === 2 ? _e2 - 2 : _e2 + 1];
          if (halfedges[_e2] === -1 || inedges[_p] === -1) inedges[_p] = _e2;
        }

        for (var _i15 = 0, _n3 = hull.length; _i15 < _n3; ++_i15) {
          hullIndex[hull[_i15]] = _i15;
        } // degenerate case: 1 or 2 (distinct) points


        if (hull.length <= 2 && hull.length > 0) {
          this.triangles = new Int32Array(3).fill(-1);
          this.halfedges = new Int32Array(3).fill(-1);
          this.triangles[0] = hull[0];
          this.triangles[1] = hull[1];
          this.triangles[2] = hull[1];
          inedges[hull[0]] = 1;
          if (hull.length === 2) inedges[hull[1]] = 0;
        }
      }
    }, {
      key: "voronoi",
      value: function voronoi(bounds) {
        return new Voronoi(this, bounds);
      }
    }, {
      key: "neighbors",
      value: /*#__PURE__*/regeneratorRuntime.mark(function neighbors(i) {
        var inedges, hull, _hullIndex, halfedges, triangles, collinear, l, e0, e, p0, p;

        return regeneratorRuntime.wrap(function neighbors$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                inedges = this.inedges, hull = this.hull, _hullIndex = this._hullIndex, halfedges = this.halfedges, triangles = this.triangles, collinear = this.collinear; // degenerate case with several collinear points

                if (!collinear) {
                  _context3.next = 10;
                  break;
                }

                l = collinear.indexOf(i);

                if (!(l > 0)) {
                  _context3.next = 6;
                  break;
                }

                _context3.next = 6;
                return collinear[l - 1];

              case 6:
                if (!(l < collinear.length - 1)) {
                  _context3.next = 9;
                  break;
                }

                _context3.next = 9;
                return collinear[l + 1];

              case 9:
                return _context3.abrupt("return");

              case 10:
                e0 = inedges[i];

                if (!(e0 === -1)) {
                  _context3.next = 13;
                  break;
                }

                return _context3.abrupt("return");

              case 13:
                // coincident point
                e = e0, p0 = -1;

              case 14:
                _context3.next = 16;
                return p0 = triangles[e];

              case 16:
                e = e % 3 === 2 ? e - 2 : e + 1;

                if (!(triangles[e] !== i)) {
                  _context3.next = 19;
                  break;
                }

                return _context3.abrupt("return");

              case 19:
                // bad triangulation
                e = halfedges[e];

                if (!(e === -1)) {
                  _context3.next = 26;
                  break;
                }

                p = hull[(_hullIndex[i] + 1) % hull.length];

                if (!(p !== p0)) {
                  _context3.next = 25;
                  break;
                }

                _context3.next = 25;
                return p;

              case 25:
                return _context3.abrupt("return");

              case 26:
                if (e !== e0) {
                  _context3.next = 14;
                  break;
                }

              case 27:
              case "end":
                return _context3.stop();
            }
          }
        }, neighbors, this);
      })
    }, {
      key: "find",
      value: function find(x, y) {
        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        if ((x = +x, x !== x) || (y = +y, y !== y)) return -1;
        var i0 = i;
        var c;

        while ((c = this._step(i, x, y)) >= 0 && c !== i && c !== i0) {
          i = c;
        }

        return c;
      }
    }, {
      key: "_step",
      value: function _step(i, x, y) {
        var inedges = this.inedges,
            hull = this.hull,
            _hullIndex = this._hullIndex,
            halfedges = this.halfedges,
            triangles = this.triangles,
            points = this.points;
        if (inedges[i] === -1 || !points.length) return (i + 1) % (points.length >> 1);
        var c = i;
        var dc = Math.pow(x - points[i * 2], 2) + Math.pow(y - points[i * 2 + 1], 2);
        var e0 = inedges[i];
        var e = e0;

        do {
          var t = triangles[e];
          var dt = Math.pow(x - points[t * 2], 2) + Math.pow(y - points[t * 2 + 1], 2);
          if (dt < dc) dc = dt, c = t;
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) break; // bad triangulation

          e = halfedges[e];

          if (e === -1) {
            e = hull[(_hullIndex[i] + 1) % hull.length];

            if (e !== t) {
              if (Math.pow(x - points[e * 2], 2) + Math.pow(y - points[e * 2 + 1], 2) < dc) return e;
            }

            break;
          }
        } while (e !== e0);

        return c;
      }
    }, {
      key: "render",
      value: function render(context) {
        var buffer = context == null ? context = new Path() : undefined;
        var points = this.points,
            halfedges = this.halfedges,
            triangles = this.triangles;

        for (var i = 0, n = halfedges.length; i < n; ++i) {
          var j = halfedges[i];
          if (j < i) continue;
          var ti = triangles[i] * 2;
          var tj = triangles[j] * 2;
          context.moveTo(points[ti], points[ti + 1]);
          context.lineTo(points[tj], points[tj + 1]);
        }

        this.renderHull(context);
        return buffer && buffer.value();
      }
    }, {
      key: "renderPoints",
      value: function renderPoints(context) {
        var r = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
        var buffer = context == null ? context = new Path() : undefined;
        var points = this.points;

        for (var i = 0, n = points.length; i < n; i += 2) {
          var x = points[i],
              y = points[i + 1];
          context.moveTo(x + r, y);
          context.arc(x, y, r, 0, tau);
        }

        return buffer && buffer.value();
      }
    }, {
      key: "renderHull",
      value: function renderHull(context) {
        var buffer = context == null ? context = new Path() : undefined;
        var hull = this.hull,
            points = this.points;
        var h = hull[0] * 2,
            n = hull.length;
        context.moveTo(points[h], points[h + 1]);

        for (var i = 1; i < n; ++i) {
          var _h = 2 * hull[i];

          context.lineTo(points[_h], points[_h + 1]);
        }

        context.closePath();
        return buffer && buffer.value();
      }
    }, {
      key: "hullPolygon",
      value: function hullPolygon() {
        var polygon = new Polygon();
        this.renderHull(polygon);
        return polygon.value();
      }
    }, {
      key: "renderTriangle",
      value: function renderTriangle(i, context) {
        var buffer = context == null ? context = new Path() : undefined;
        var points = this.points,
            triangles = this.triangles;
        var t0 = triangles[i *= 3] * 2;
        var t1 = triangles[i + 1] * 2;
        var t2 = triangles[i + 2] * 2;
        context.moveTo(points[t0], points[t0 + 1]);
        context.lineTo(points[t1], points[t1 + 1]);
        context.lineTo(points[t2], points[t2 + 1]);
        context.closePath();
        return buffer && buffer.value();
      }
    }, {
      key: "trianglePolygons",
      value: /*#__PURE__*/regeneratorRuntime.mark(function trianglePolygons() {
        var triangles, i, n;
        return regeneratorRuntime.wrap(function trianglePolygons$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                triangles = this.triangles;
                i = 0, n = triangles.length / 3;

              case 2:
                if (!(i < n)) {
                  _context4.next = 8;
                  break;
                }

                _context4.next = 5;
                return this.trianglePolygon(i);

              case 5:
                ++i;
                _context4.next = 2;
                break;

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, trianglePolygons, this);
      })
    }, {
      key: "trianglePolygon",
      value: function trianglePolygon(i) {
        var polygon = new Polygon();
        this.renderTriangle(i, polygon);
        return polygon.value();
      }
    }]);

    return Delaunay;
  }();

  function flatArray(points, fx, fy, that) {
    var n = points.length;
    var array = new Float64Array(n * 2);

    for (var i = 0; i < n; ++i) {
      var p = points[i];
      array[i * 2] = fx.call(that, p, i, points);
      array[i * 2 + 1] = fy.call(that, p, i, points);
    }

    return array;
  }

  function flatIterable(points, fx, fy, that) {
    var i, _iterator2, _step2, p;

    return regeneratorRuntime.wrap(function flatIterable$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            i = 0;
            _iterator2 = _createForOfIteratorHelper(points);
            _context5.prev = 2;

            _iterator2.s();

          case 4:
            if ((_step2 = _iterator2.n()).done) {
              _context5.next = 13;
              break;
            }

            p = _step2.value;
            _context5.next = 8;
            return fx.call(that, p, i, points);

          case 8:
            _context5.next = 10;
            return fy.call(that, p, i, points);

          case 10:
            ++i;

          case 11:
            _context5.next = 4;
            break;

          case 13:
            _context5.next = 18;
            break;

          case 15:
            _context5.prev = 15;
            _context5.t0 = _context5["catch"](2);

            _iterator2.e(_context5.t0);

          case 18:
            _context5.prev = 18;

            _iterator2.f();

            return _context5.finish(18);

          case 21:
          case "end":
            return _context5.stop();
        }
      }
    }, _marked, null, [[2, 15, 18, 21]]);
  }

  exports.Delaunay = Delaunay;
  exports.Voronoi = Voronoi;
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
});
