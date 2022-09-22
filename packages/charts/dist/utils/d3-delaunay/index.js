"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delaunay = exports.Voronoi = void 0;
var EPSILON = Math.pow(2, -52);
var EDGE_STACK = new Uint32Array(512);
var Delaunator = (function () {
    function Delaunator(coords) {
        var n = coords.length >> 1;
        if (n > 0 && typeof coords[0] !== 'number')
            throw new Error('Expected coords to contain numbers.');
        this.coords = coords;
        var maxTriangles = Math.max(2 * n - 5, 0);
        this._triangles = new Uint32Array(maxTriangles * 3);
        this._halfedges = new Int32Array(maxTriangles * 3);
        this._hashSize = Math.ceil(Math.sqrt(n));
        this._hullPrev = new Uint32Array(n);
        this._hullNext = new Uint32Array(n);
        this._hullTri = new Uint32Array(n);
        this._hullHash = new Int32Array(this._hashSize).fill(-1);
        this._ids = new Uint32Array(n);
        this._dists = new Float64Array(n);
        this.update();
    }
    Delaunator.from = function (points, getX, getY) {
        if (getX === void 0) { getX = defaultGetX; }
        if (getY === void 0) { getY = defaultGetY; }
        var n = points.length;
        var coords = new Float64Array(n * 2);
        for (var i = 0; i < n; i++) {
            var p = points[i];
            coords[2 * i] = getX(p);
            coords[2 * i + 1] = getY(p);
        }
        return new Delaunator(coords);
    };
    Delaunator.prototype.update = function () {
        var _a = this, coords = _a.coords, hullPrev = _a._hullPrev, hullNext = _a._hullNext, hullTri = _a._hullTri, hullHash = _a._hullHash;
        var n = coords.length >> 1;
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        for (var i = 0; i < n; i++) {
            var x = coords[2 * i];
            var y = coords[2 * i + 1];
            if (x < minX)
                minX = x;
            if (y < minY)
                minY = y;
            if (x > maxX)
                maxX = x;
            if (y > maxY)
                maxY = y;
            this._ids[i] = i;
        }
        var cx = (minX + maxX) / 2;
        var cy = (minY + maxY) / 2;
        var minDist = Infinity;
        var i0, i1, i2;
        for (var i = 0; i < n; i++) {
            var d = dist(cx, cy, coords[2 * i], coords[2 * i + 1]);
            if (d < minDist) {
                i0 = i;
                minDist = d;
            }
        }
        var i0x = coords[2 * i0];
        var i0y = coords[2 * i0 + 1];
        minDist = Infinity;
        for (var i = 0; i < n; i++) {
            if (i === i0)
                continue;
            var d = dist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
            if (d < minDist && d > 0) {
                i1 = i;
                minDist = d;
            }
        }
        var i1x = coords[2 * i1];
        var i1y = coords[2 * i1 + 1];
        var minRadius = Infinity;
        for (var i = 0; i < n; i++) {
            if (i === i0 || i === i1)
                continue;
            var r = circumradius(i0x, i0y, i1x, i1y, coords[2 * i], coords[2 * i + 1]);
            if (r < minRadius) {
                i2 = i;
                minRadius = r;
            }
        }
        var i2x = coords[2 * i2];
        var i2y = coords[2 * i2 + 1];
        if (minRadius === Infinity) {
            for (var i = 0; i < n; i++) {
                this._dists[i] = coords[2 * i] - coords[0] || coords[2 * i + 1] - coords[1];
            }
            quicksort(this._ids, this._dists, 0, n - 1);
            var hull = new Uint32Array(n);
            var j = 0;
            for (var i = 0, d0 = -Infinity; i < n; i++) {
                var id = this._ids[i];
                if (this._dists[id] > d0) {
                    hull[j++] = id;
                    d0 = this._dists[id];
                }
            }
            this.hull = hull.subarray(0, j);
            this.triangles = new Uint32Array(0);
            this.halfedges = new Uint32Array(0);
            return;
        }
        if (orient(i0x, i0y, i1x, i1y, i2x, i2y)) {
            var i = i1;
            var x = i1x;
            var y = i1y;
            i1 = i2;
            i1x = i2x;
            i1y = i2y;
            i2 = i;
            i2x = x;
            i2y = y;
        }
        var center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
        this._cx = center.x;
        this._cy = center.y;
        for (var i = 0; i < n; i++) {
            this._dists[i] = dist(coords[2 * i], coords[2 * i + 1], center.x, center.y);
        }
        quicksort(this._ids, this._dists, 0, n - 1);
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
        for (var k = 0, xp = void 0, yp = void 0; k < this._ids.length; k++) {
            var i = this._ids[k];
            var x = coords[2 * i];
            var y = coords[2 * i + 1];
            if (k > 0 && Math.abs(x - xp) <= EPSILON && Math.abs(y - yp) <= EPSILON)
                continue;
            xp = x;
            yp = y;
            if (i === i0 || i === i1 || i === i2)
                continue;
            var start = 0;
            for (var j = 0, key = this._hashKey(x, y); j < this._hashSize; j++) {
                start = hullHash[(key + j) % this._hashSize];
                if (start !== -1 && start !== hullNext[start])
                    break;
            }
            start = hullPrev[start];
            var e = start, q = void 0;
            while (((q = hullNext[e]), !orient(x, y, coords[2 * e], coords[2 * e + 1], coords[2 * q], coords[2 * q + 1]))) {
                e = q;
                if (e === start) {
                    e = -1;
                    break;
                }
            }
            if (e === -1)
                continue;
            var t = this._addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);
            hullTri[i] = this._legalize(t + 2);
            hullTri[e] = t;
            hullSize++;
            var n_1 = hullNext[e];
            while (((q = hullNext[n_1]), orient(x, y, coords[2 * n_1], coords[2 * n_1 + 1], coords[2 * q], coords[2 * q + 1]))) {
                t = this._addTriangle(n_1, i, q, hullTri[i], -1, hullTri[n_1]);
                hullTri[i] = this._legalize(t + 2);
                hullNext[n_1] = n_1;
                hullSize--;
                n_1 = q;
            }
            if (e === start) {
                while (((q = hullPrev[e]), orient(x, y, coords[2 * q], coords[2 * q + 1], coords[2 * e], coords[2 * e + 1]))) {
                    t = this._addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
                    this._legalize(t + 2);
                    hullTri[q] = t;
                    hullNext[e] = e;
                    hullSize--;
                    e = q;
                }
            }
            this._hullStart = hullPrev[i] = e;
            hullNext[e] = hullPrev[n_1] = i;
            hullNext[i] = n_1;
            hullHash[this._hashKey(x, y)] = i;
            hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
        }
        this.hull = new Uint32Array(hullSize);
        for (var i = 0, e = this._hullStart; i < hullSize; i++) {
            this.hull[i] = e;
            e = hullNext[e];
        }
        this.triangles = this._triangles.subarray(0, this.trianglesLen);
        this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
    };
    Delaunator.prototype._hashKey = function (x, y) {
        return Math.floor(pseudoAngle(x - this._cx, y - this._cy) * this._hashSize) % this._hashSize;
    };
    Delaunator.prototype._legalize = function (a) {
        var _a = this, triangles = _a._triangles, halfedges = _a._halfedges, coords = _a.coords;
        var i = 0;
        var ar = 0;
        while (true) {
            var b = halfedges[a];
            var a0 = a - (a % 3);
            ar = a0 + ((a + 2) % 3);
            if (b === -1) {
                if (i === 0)
                    break;
                a = EDGE_STACK[--i];
                continue;
            }
            var b0 = b - (b % 3);
            var al = a0 + ((a + 1) % 3);
            var bl = b0 + ((b + 2) % 3);
            var p0 = triangles[ar];
            var pr = triangles[a];
            var pl = triangles[al];
            var p1 = triangles[bl];
            var illegal = inCircle(coords[2 * p0], coords[2 * p0 + 1], coords[2 * pr], coords[2 * pr + 1], coords[2 * pl], coords[2 * pl + 1], coords[2 * p1], coords[2 * p1 + 1]);
            if (illegal) {
                triangles[a] = p1;
                triangles[b] = p0;
                var hbl = halfedges[bl];
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
                var br = b0 + ((b + 1) % 3);
                if (i < EDGE_STACK.length) {
                    EDGE_STACK[i++] = br;
                }
            }
            else {
                if (i === 0)
                    break;
                a = EDGE_STACK[--i];
            }
        }
        return ar;
    };
    Delaunator.prototype._link = function (a, b) {
        this._halfedges[a] = b;
        if (b !== -1)
            this._halfedges[b] = a;
    };
    Delaunator.prototype._addTriangle = function (i0, i1, i2, a, b, c) {
        var t = this.trianglesLen;
        this._triangles[t] = i0;
        this._triangles[t + 1] = i1;
        this._triangles[t + 2] = i2;
        this._link(t, a);
        this._link(t + 1, b);
        this._link(t + 2, c);
        this.trianglesLen += 3;
        return t;
    };
    return Delaunator;
}());
function pseudoAngle(dx, dy) {
    var p = dx / (Math.abs(dx) + Math.abs(dy));
    return (dy > 0 ? 3 - p : 1 + p) / 4;
}
function dist(ax, ay, bx, by) {
    var dx = ax - bx;
    var dy = ay - by;
    return dx * dx + dy * dy;
}
function orientIfSure(px, py, rx, ry, qx, qy) {
    var l = (ry - py) * (qx - px);
    var r = (rx - px) * (qy - py);
    return Math.abs(l - r) >= 3.3306690738754716e-16 * Math.abs(l + r) ? l - r : 0;
}
function orient(rx, ry, qx, qy, px, py) {
    var sign = orientIfSure(px, py, rx, ry, qx, qy) ||
        orientIfSure(rx, ry, qx, qy, px, py) ||
        orientIfSure(qx, qy, px, py, rx, ry);
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
    return { x: x, y: y };
}
function quicksort(ids, dists, left, right) {
    if (right - left <= 20) {
        for (var i = left + 1; i <= right; i++) {
            var temp = ids[i];
            var tempDist = dists[temp];
            var j = i - 1;
            while (j >= left && dists[ids[j]] > tempDist)
                ids[j + 1] = ids[j--];
            ids[j + 1] = temp;
        }
    }
    else {
        var median = (left + right) >> 1;
        var i = left + 1;
        var j = right;
        swap(ids, median, i);
        if (dists[ids[left]] > dists[ids[right]])
            swap(ids, left, right);
        if (dists[ids[i]] > dists[ids[right]])
            swap(ids, i, right);
        if (dists[ids[left]] > dists[ids[i]])
            swap(ids, left, i);
        var temp = ids[i];
        var tempDist = dists[temp];
        while (true) {
            do
                i++;
            while (dists[ids[i]] < tempDist);
            do
                j--;
            while (dists[ids[j]] > tempDist);
            if (j < i)
                break;
            swap(ids, i, j);
        }
        ids[left + 1] = ids[j];
        ids[j] = temp;
        if (right - i + 1 >= j - left) {
            quicksort(ids, dists, i, right);
            quicksort(ids, dists, left, j - 1);
        }
        else {
            quicksort(ids, dists, left, j - 1);
            quicksort(ids, dists, i, right);
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
var Path = (function () {
    function Path() {
        this._x0 = this._y0 = this._x1 = this._y1 = null;
        this._ = '';
    }
    Path.prototype.moveTo = function (x, y) {
        this._ += "M".concat((this._x0 = this._x1 = +x), ",").concat((this._y0 = this._y1 = +y));
    };
    Path.prototype.closePath = function () {
        if (this._x1 !== null) {
            (this._x1 = this._x0), (this._y1 = this._y0);
            this._ += 'Z';
        }
    };
    Path.prototype.lineTo = function (x, y) {
        this._ += "L".concat((this._x1 = +x), ",").concat((this._y1 = +y));
    };
    Path.prototype.arc = function (x, y, r) {
        (x = +x), (y = +y), (r = +r);
        var x0 = x + r;
        var y0 = y;
        if (r < 0)
            throw new Error('negative radius');
        if (this._x1 === null)
            this._ += "M".concat(x0, ",").concat(y0);
        else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon)
            this._ += 'L' + x0 + ',' + y0;
        if (!r)
            return;
        this._ += "A".concat(r, ",").concat(r, ",0,1,1,").concat(x - r, ",").concat(y, "A").concat(r, ",").concat(r, ",0,1,1,").concat((this._x1 = x0), ",").concat((this._y1 = y0));
    };
    Path.prototype.rect = function (x, y, w, h) {
        this._ += "M".concat((this._x0 = this._x1 = +x), ",").concat((this._y0 = this._y1 = +y), "h").concat(+w, "v").concat(+h, "h").concat(-w, "Z");
    };
    Path.prototype.value = function () {
        return this._ || null;
    };
    return Path;
}());
var Polygon = (function () {
    function Polygon() {
        this._ = [];
    }
    Polygon.prototype.moveTo = function (x, y) {
        this._.push([x, y]);
    };
    Polygon.prototype.closePath = function () {
        this._.push(this._[0].slice());
    };
    Polygon.prototype.lineTo = function (x, y) {
        this._.push([x, y]);
    };
    Polygon.prototype.value = function () {
        return this._.length ? this._ : null;
    };
    return Polygon;
}());
var Voronoi = (function () {
    function Voronoi(delaunay, _a) {
        var _b = _a === void 0 ? [0, 0, 960, 500] : _a, _c = __read(_b, 4), xmin = _c[0], ymin = _c[1], xmax = _c[2], ymax = _c[3];
        if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin)))
            throw new Error('invalid bounds');
        this.delaunay = delaunay;
        this._circumcenters = new Float64Array(delaunay.points.length * 2);
        this.vectors = new Float64Array(delaunay.points.length * 2);
        (this.xmax = xmax), (this.xmin = xmin);
        (this.ymax = ymax), (this.ymin = ymin);
        this._init();
    }
    Voronoi.prototype.update = function () {
        this.delaunay.update();
        this._init();
        return this;
    };
    Voronoi.prototype._init = function () {
        var _a = this, _b = _a.delaunay, points = _b.points, hull = _b.hull, triangles = _b.triangles, vectors = _a.vectors;
        var circumcenters = (this.circumcenters = this._circumcenters.subarray(0, (triangles.length / 3) * 2));
        for (var i = 0, j = 0, n = triangles.length, x = void 0, y = void 0; i < n; i += 3, j += 2) {
            var t1 = triangles[i] * 2;
            var t2 = triangles[i + 1] * 2;
            var t3 = triangles[i + 2] * 2;
            var x1_1 = points[t1];
            var y1_1 = points[t1 + 1];
            var x2 = points[t2];
            var y2 = points[t2 + 1];
            var x3 = points[t3];
            var y3 = points[t3 + 1];
            var dx = x2 - x1_1;
            var dy = y2 - y1_1;
            var ex = x3 - x1_1;
            var ey = y3 - y1_1;
            var bl = dx * dx + dy * dy;
            var cl = ex * ex + ey * ey;
            var ab = (dx * ey - dy * ex) * 2;
            if (!ab) {
                x = (x1_1 + x3) / 2 - 1e8 * ey;
                y = (y1_1 + y3) / 2 + 1e8 * ex;
            }
            else if (Math.abs(ab) < 1e-8) {
                x = (x1_1 + x3) / 2;
                y = (y1_1 + y3) / 2;
            }
            else {
                var d = 1 / ab;
                x = x1_1 + (ey * bl - dy * cl) * d;
                y = y1_1 + (dx * cl - ex * bl) * d;
            }
            circumcenters[j] = x;
            circumcenters[j + 1] = y;
        }
        var h = hull[hull.length - 1];
        var p0, p1 = h * 4;
        var x0, x1 = points[2 * h];
        var y0, y1 = points[2 * h + 1];
        vectors.fill(0);
        for (var i = 0; i < hull.length; ++i) {
            h = hull[i];
            (p0 = p1), (x0 = x1), (y0 = y1);
            (p1 = h * 4), (x1 = points[2 * h]), (y1 = points[2 * h + 1]);
            vectors[p0 + 2] = vectors[p1] = y0 - y1;
            vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
        }
    };
    Voronoi.prototype.render = function (context) {
        var buffer = context === null ? (context = new Path()) : undefined;
        var _a = this, _b = _a.delaunay, halfedges = _b.halfedges, inedges = _b.inedges, hull = _b.hull, circumcenters = _a.circumcenters, vectors = _a.vectors;
        if (hull.length <= 1)
            return null;
        for (var i = 0, n = halfedges.length; i < n; ++i) {
            var j = halfedges[i];
            if (j < i)
                continue;
            var ti = Math.floor(i / 3) * 2;
            var tj = Math.floor(j / 3) * 2;
            var xi = circumcenters[ti];
            var yi = circumcenters[ti + 1];
            var xj = circumcenters[tj];
            var yj = circumcenters[tj + 1];
            this._renderSegment(xi, yi, xj, yj, context);
        }
        var h0, h1 = hull[hull.length - 1];
        for (var i = 0; i < hull.length; ++i) {
            (h0 = h1), (h1 = hull[i]);
            var t = Math.floor(inedges[h1] / 3) * 2;
            var x = circumcenters[t];
            var y = circumcenters[t + 1];
            var v = h0 * 4;
            var p = this._project(x, y, vectors[v + 2], vectors[v + 3]);
            if (p)
                this._renderSegment(x, y, p[0], p[1], context);
        }
        return buffer && buffer.value();
    };
    Voronoi.prototype.renderBounds = function (context) {
        var buffer = context === null ? (context = new Path()) : undefined;
        context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
        return buffer && buffer.value();
    };
    Voronoi.prototype.renderCell = function (i, context) {
        var buffer = context == null ? (context = new Path()) : undefined;
        var points = this._clip(i);
        if (points === null)
            return;
        context.moveTo(points[0], points[1]);
        var n = points.length;
        while (points[0] === points[n - 2] && points[1] === points[n - 1] && n > 1)
            n -= 2;
        for (var i_1 = 2; i_1 < n; i_1 += 2) {
            if (points[i_1] !== points[i_1 - 2] || points[i_1 + 1] !== points[i_1 - 1])
                context.lineTo(points[i_1], points[i_1 + 1]);
        }
        context.closePath();
        return buffer && buffer.value();
    };
    Voronoi.prototype.cellPolygons = function () {
        var points, i, n, cell;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    points = this.delaunay.points;
                    i = 0, n = points.length / 2;
                    _a.label = 1;
                case 1:
                    if (!(i < n)) return [3, 4];
                    cell = this.cellPolygon(i);
                    if (!cell) return [3, 3];
                    return [4, cell];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    ++i;
                    return [3, 1];
                case 4: return [2];
            }
        });
    };
    Voronoi.prototype.cellPolygon = function (i) {
        var polygon = new Polygon();
        this.renderCell(i, polygon);
        return polygon.value();
    };
    Voronoi.prototype._renderSegment = function (x0, y0, x1, y1, context) {
        var S;
        var c0 = this._regioncode(x0, y0);
        var c1 = this._regioncode(x1, y1);
        if (c0 === 0 && c1 === 0) {
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
        }
        else if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1))) {
            context.moveTo(S[0], S[1]);
            context.lineTo(S[2], S[3]);
        }
    };
    Voronoi.prototype.contains = function (i, x, y) {
        if (((x = +x), x !== x) || ((y = +y), y !== y))
            return false;
        return this.delaunay._step(i, x, y) === i;
    };
    Voronoi.prototype.neighbors = function (i) {
        var ci, _a, _b, j, cj, ai, li, aj, lj, e_1_1;
        var e_1, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    ci = this._clip(i);
                    if (!ci) return [3, 12];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 10, 11, 12]);
                    _a = __values(this.delaunay.neighbors(i)), _b = _a.next();
                    _d.label = 2;
                case 2:
                    if (!!_b.done) return [3, 9];
                    j = _b.value;
                    cj = this._clip(j);
                    if (!cj) return [3, 8];
                    ai = 0, li = ci.length;
                    _d.label = 3;
                case 3:
                    if (!(ai < li)) return [3, 8];
                    aj = 0, lj = cj.length;
                    _d.label = 4;
                case 4:
                    if (!(aj < lj)) return [3, 7];
                    if (!(ci[ai] == cj[aj] &&
                        ci[ai + 1] == cj[aj + 1] &&
                        ci[(ai + 2) % li] == cj[(aj + lj - 2) % lj] &&
                        ci[(ai + 3) % li] == cj[(aj + lj - 1) % lj])) return [3, 6];
                    return [4, j];
                case 5:
                    _d.sent();
                    return [3, 8];
                case 6:
                    aj += 2;
                    return [3, 4];
                case 7:
                    ai += 2;
                    return [3, 3];
                case 8:
                    _b = _a.next();
                    return [3, 2];
                case 9: return [3, 12];
                case 10:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3, 12];
                case 11:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7];
                case 12: return [2];
            }
        });
    };
    Voronoi.prototype._cell = function (i) {
        var _a = this, circumcenters = _a.circumcenters, _b = _a.delaunay, inedges = _b.inedges, halfedges = _b.halfedges, triangles = _b.triangles;
        var e0 = inedges[i];
        if (e0 === -1)
            return null;
        var points = [];
        var e = e0;
        do {
            var t = Math.floor(e / 3);
            points.push(circumcenters[t * 2], circumcenters[t * 2 + 1]);
            e = e % 3 === 2 ? e - 2 : e + 1;
            if (triangles[e] !== i)
                break;
            e = halfedges[e];
        } while (e !== e0 && e !== -1);
        return points;
    };
    Voronoi.prototype._clip = function (i) {
        if (i === 0 && this.delaunay.hull.length === 1) {
            return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }
        var points = this._cell(i);
        if (points === null)
            return null;
        var V = this.vectors;
        var v = i * 4;
        return V[v] || V[v + 1]
            ? this._clipInfinite(i, points, V[v], V[v + 1], V[v + 2], V[v + 3])
            : this._clipFinite(i, points);
    };
    Voronoi.prototype._clipFinite = function (i, points) {
        var _a, _b;
        var n = points.length;
        var P = null;
        var x0, y0, x1 = points[n - 2], y1 = points[n - 1];
        var c0, c1 = this._regioncode(x1, y1);
        var e0, e1;
        for (var j = 0; j < n; j += 2) {
            (x0 = x1), (y0 = y1), (x1 = points[j]), (y1 = points[j + 1]);
            (c0 = c1), (c1 = this._regioncode(x1, y1));
            if (c0 === 0 && c1 === 0) {
                (e0 = e1), (e1 = 0);
                if (P)
                    P.push(x1, y1);
                else
                    P = [x1, y1];
            }
            else {
                var S = void 0, sx0 = void 0, sy0 = void 0, sx1 = void 0, sy1 = void 0;
                if (c0 === 0) {
                    if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null)
                        continue;
                    _a = __read(S, 4), sx0 = _a[0], sy0 = _a[1], sx1 = _a[2], sy1 = _a[3];
                }
                else {
                    if ((S = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null)
                        continue;
                    _b = __read(S, 4), sx1 = _b[0], sy1 = _b[1], sx0 = _b[2], sy0 = _b[3];
                    (e0 = e1), (e1 = this._edgecode(sx0, sy0));
                    if (e0 && e1)
                        this._edge(i, e0, e1, P, P.length);
                    if (P)
                        P.push(sx0, sy0);
                    else
                        P = [sx0, sy0];
                }
                (e0 = e1), (e1 = this._edgecode(sx1, sy1));
                if (e0 && e1)
                    this._edge(i, e0, e1, P, P.length);
                if (P)
                    P.push(sx1, sy1);
                else
                    P = [sx1, sy1];
            }
        }
        if (P) {
            (e0 = e1), (e1 = this._edgecode(P[0], P[1]));
            if (e0 && e1)
                this._edge(i, e0, e1, P, P.length);
        }
        else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
            return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }
        return P;
    };
    Voronoi.prototype._clipSegment = function (x0, y0, x1, y1, c0, c1) {
        while (true) {
            if (c0 === 0 && c1 === 0)
                return [x0, y0, x1, y1];
            if (c0 & c1)
                return null;
            var x = void 0, y = void 0, c = c0 || c1;
            if (c & 8)
                (x = x0 + ((x1 - x0) * (this.ymax - y0)) / (y1 - y0)), (y = this.ymax);
            else if (c & 4)
                (x = x0 + ((x1 - x0) * (this.ymin - y0)) / (y1 - y0)), (y = this.ymin);
            else if (c & 2)
                (y = y0 + ((y1 - y0) * (this.xmax - x0)) / (x1 - x0)), (x = this.xmax);
            else
                (y = y0 + ((y1 - y0) * (this.xmin - x0)) / (x1 - x0)), (x = this.xmin);
            if (c0)
                (x0 = x), (y0 = y), (c0 = this._regioncode(x0, y0));
            else
                (x1 = x), (y1 = y), (c1 = this._regioncode(x1, y1));
        }
    };
    Voronoi.prototype._clipInfinite = function (i, points, vx0, vy0, vxn, vyn) {
        var P = Array.from(points), p;
        if ((p = this._project(P[0], P[1], vx0, vy0)))
            P.unshift(p[0], p[1]);
        if ((p = this._project(P[P.length - 2], P[P.length - 1], vxn, vyn)))
            P.push(p[0], p[1]);
        if ((P = this._clipFinite(i, P))) {
            for (var j = 0, n = P.length, c0 = void 0, c1 = this._edgecode(P[n - 2], P[n - 1]); j < n; j += 2) {
                (c0 = c1), (c1 = this._edgecode(P[j], P[j + 1]));
                if (c0 && c1)
                    (j = this._edge(i, c0, c1, P, j)), (n = P.length);
            }
        }
        else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
            P = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
        }
        return P;
    };
    Voronoi.prototype._edge = function (i, e0, e1, P, j) {
        while (e0 !== e1) {
            var x = void 0, y = void 0;
            switch (e0) {
                case 5:
                    e0 = 4;
                    continue;
                case 4:
                    (e0 = 6), (x = this.xmax), (y = this.ymin);
                    break;
                case 6:
                    e0 = 2;
                    continue;
                case 2:
                    (e0 = 10), (x = this.xmax), (y = this.ymax);
                    break;
                case 10:
                    e0 = 8;
                    continue;
                case 8:
                    (e0 = 9), (x = this.xmin), (y = this.ymax);
                    break;
                case 9:
                    e0 = 1;
                    continue;
                case 1:
                    (e0 = 5), (x = this.xmin), (y = this.ymin);
                    break;
            }
            if ((P[j] !== x || P[j + 1] !== y) && this.contains(i, x, y)) {
                P.splice(j, 0, x, y), (j += 2);
            }
        }
        if (P.length > 4) {
            for (var i_2 = 0; i_2 < P.length; i_2 += 2) {
                var j_1 = (i_2 + 2) % P.length, k = (i_2 + 4) % P.length;
                if ((P[i_2] === P[j_1] && P[j_1] === P[k]) || (P[i_2 + 1] === P[j_1 + 1] && P[j_1 + 1] === P[k + 1]))
                    P.splice(j_1, 2), (i_2 -= 2);
            }
        }
        return j;
    };
    Voronoi.prototype._project = function (x0, y0, vx, vy) {
        var t = Infinity, c, x, y;
        if (vy < 0) {
            if (y0 <= this.ymin)
                return null;
            if ((c = (this.ymin - y0) / vy) < t)
                (y = this.ymin), (x = x0 + (t = c) * vx);
        }
        else if (vy > 0) {
            if (y0 >= this.ymax)
                return null;
            if ((c = (this.ymax - y0) / vy) < t)
                (y = this.ymax), (x = x0 + (t = c) * vx);
        }
        if (vx > 0) {
            if (x0 >= this.xmax)
                return null;
            if ((c = (this.xmax - x0) / vx) < t)
                (x = this.xmax), (y = y0 + (t = c) * vy);
        }
        else if (vx < 0) {
            if (x0 <= this.xmin)
                return null;
            if ((c = (this.xmin - x0) / vx) < t)
                (x = this.xmin), (y = y0 + (t = c) * vy);
        }
        return [x, y];
    };
    Voronoi.prototype._edgecode = function (x, y) {
        return ((x === this.xmin ? 1 : x === this.xmax ? 2 : 0) |
            (y === this.ymin ? 4 : y === this.ymax ? 8 : 0));
    };
    Voronoi.prototype._regioncode = function (x, y) {
        return ((x < this.xmin ? 1 : x > this.xmax ? 2 : 0) |
            (y < this.ymin ? 4 : y > this.ymax ? 8 : 0));
    };
    return Voronoi;
}());
exports.Voronoi = Voronoi;
var tau = 2 * Math.PI;
function pointX(p) {
    return p[0];
}
function pointY(p) {
    return p[1];
}
function collinear(d) {
    var triangles = d.triangles, coords = d.coords;
    for (var i = 0; i < triangles.length; i += 3) {
        var a = 2 * triangles[i], b = 2 * triangles[i + 1], c = 2 * triangles[i + 2], cross = (coords[c] - coords[a]) * (coords[b + 1] - coords[a + 1]) -
            (coords[b] - coords[a]) * (coords[c + 1] - coords[a + 1]);
        if (cross > 1e-10)
            return false;
    }
    return true;
}
function jitter(x, y, r) {
    return [x + Math.sin(x + y) * r, y + Math.cos(x - y) * r];
}
var Delaunay = (function () {
    function Delaunay(points) {
        this._delaunator = new Delaunator(points);
        this.inedges = new Int32Array(points.length / 2);
        this._hullIndex = new Int32Array(points.length / 2);
        this.points = this._delaunator.coords;
        this._init();
    }
    Delaunay.from = function (points, fx, fy, that) {
        if (fx === void 0) { fx = pointX; }
        if (fy === void 0) { fy = pointY; }
        return new Delaunay('length' in points ? flatArray(points, fx, fy, that) : Float64Array.from(flatIterable(points, fx, fy, that)));
    };
    Delaunay.prototype.update = function () {
        this._delaunator.update();
        this._init();
        return this;
    };
    Delaunay.prototype._init = function () {
        var d = this._delaunator, points = this.points;
        if (d.hull && d.hull.length > 2 && collinear(d)) {
            this.collinear = Int32Array.from({ length: points.length / 2 }, function (_, i) { return i; }).sort(function (i, j) { return points[2 * i] - points[2 * j] || points[2 * i + 1] - points[2 * j + 1]; });
            var e = this.collinear[0], f = this.collinear[this.collinear.length - 1], bounds = [points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1]], r = 1e-8 * Math.sqrt(Math.pow((bounds[3] - bounds[1]), 2) + Math.pow((bounds[2] - bounds[0]), 2));
            for (var i = 0, n = points.length / 2; i < n; ++i) {
                var p = jitter(points[2 * i], points[2 * i + 1], r);
                points[2 * i] = p[0];
                points[2 * i + 1] = p[1];
            }
            this._delaunator = new Delaunator(points);
        }
        else {
            delete this.collinear;
        }
        var halfedges = (this.halfedges = this._delaunator.halfedges);
        var hull = (this.hull = this._delaunator.hull);
        var triangles = (this.triangles = this._delaunator.triangles);
        var inedges = this.inedges.fill(-1);
        var hullIndex = this._hullIndex.fill(-1);
        for (var e = 0, n = halfedges.length; e < n; ++e) {
            var p = triangles[e % 3 === 2 ? e - 2 : e + 1];
            if (halfedges[e] === -1 || inedges[p] === -1)
                inedges[p] = e;
        }
        for (var i = 0, n = hull.length; i < n; ++i) {
            hullIndex[hull[i]] = i;
        }
        if (hull.length <= 2 && hull.length > 0) {
            this.triangles = new Int32Array(3).fill(-1);
            this.halfedges = new Int32Array(3).fill(-1);
            this.triangles[0] = hull[0];
            this.triangles[1] = hull[1];
            this.triangles[2] = hull[1];
            inedges[hull[0]] = 1;
            if (hull.length === 2)
                inedges[hull[1]] = 0;
        }
    };
    Delaunay.prototype.voronoi = function (bounds) {
        return new Voronoi(this, bounds);
    };
    Delaunay.prototype.neighbors = function (i) {
        var _a, inedges, hull, _hullIndex, halfedges, triangles, collinear, l, e0, e, p0, p;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = this, inedges = _a.inedges, hull = _a.hull, _hullIndex = _a._hullIndex, halfedges = _a.halfedges, triangles = _a.triangles, collinear = _a.collinear;
                    if (!collinear) return [3, 5];
                    l = collinear.indexOf(i);
                    if (!(l > 0)) return [3, 2];
                    return [4, collinear[l - 1]];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    if (!(l < collinear.length - 1)) return [3, 4];
                    return [4, collinear[l + 1]];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: return [2];
                case 5:
                    e0 = inedges[i];
                    if (e0 === -1)
                        return [2];
                    e = e0, p0 = -1;
                    _b.label = 6;
                case 6: return [4, (p0 = triangles[e])];
                case 7:
                    _b.sent();
                    e = e % 3 === 2 ? e - 2 : e + 1;
                    if (triangles[e] !== i)
                        return [2];
                    e = halfedges[e];
                    if (!(e === -1)) return [3, 10];
                    p = hull[(_hullIndex[i] + 1) % hull.length];
                    if (!(p !== p0)) return [3, 9];
                    return [4, p];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [2];
                case 10:
                    if (e !== e0) return [3, 6];
                    _b.label = 11;
                case 11: return [2];
            }
        });
    };
    Delaunay.prototype.find = function (x, y, i) {
        if (i === void 0) { i = 0; }
        if (((x = +x), x !== x) || ((y = +y), y !== y))
            return -1;
        var i0 = i;
        var c;
        while ((c = this._step(i, x, y)) >= 0 && c !== i && c !== i0)
            i = c;
        return c;
    };
    Delaunay.prototype._step = function (i, x, y) {
        var _a = this, inedges = _a.inedges, hull = _a.hull, _hullIndex = _a._hullIndex, halfedges = _a.halfedges, triangles = _a.triangles, points = _a.points;
        if (inedges[i] === -1 || !points.length)
            return (i + 1) % (points.length >> 1);
        var c = i;
        var dc = Math.pow((x - points[i * 2]), 2) + Math.pow((y - points[i * 2 + 1]), 2);
        var e0 = inedges[i];
        var e = e0;
        do {
            var t = triangles[e];
            var dt = Math.pow((x - points[t * 2]), 2) + Math.pow((y - points[t * 2 + 1]), 2);
            if (dt < dc)
                (dc = dt), (c = t);
            e = e % 3 === 2 ? e - 2 : e + 1;
            if (triangles[e] !== i)
                break;
            e = halfedges[e];
            if (e === -1) {
                e = hull[(_hullIndex[i] + 1) % hull.length];
                if (e !== t) {
                    if (Math.pow((x - points[e * 2]), 2) + Math.pow((y - points[e * 2 + 1]), 2) < dc)
                        return e;
                }
                break;
            }
        } while (e !== e0);
        return c;
    };
    Delaunay.prototype.render = function (context) {
        var buffer = context == null ? (context = new Path()) : undefined;
        var _a = this, points = _a.points, halfedges = _a.halfedges, triangles = _a.triangles;
        for (var i = 0, n = halfedges.length; i < n; ++i) {
            var j = halfedges[i];
            if (j < i)
                continue;
            var ti = triangles[i] * 2;
            var tj = triangles[j] * 2;
            context.moveTo(points[ti], points[ti + 1]);
            context.lineTo(points[tj], points[tj + 1]);
        }
        this.renderHull(context);
        return buffer && buffer.value();
    };
    Delaunay.prototype.renderPoints = function (context, r) {
        var buffer = context == null ? (context = new Path()) : undefined;
        var points = this.points;
        for (var i = 0, n = points.length; i < n; i += 2) {
            var x = points[i], y = points[i + 1];
            context.moveTo(x + r, y);
            context.arc(x, y, r, 0, tau);
        }
        return buffer && buffer.value();
    };
    Delaunay.prototype.renderHull = function (context) {
        var buffer = context == null ? (context = new Path()) : undefined;
        var _a = this, hull = _a.hull, points = _a.points;
        var h = hull[0] * 2, n = hull.length;
        context.moveTo(points[h], points[h + 1]);
        for (var i = 1; i < n; ++i) {
            var h_1 = 2 * hull[i];
            context.lineTo(points[h_1], points[h_1 + 1]);
        }
        context.closePath();
        return buffer && buffer.value();
    };
    Delaunay.prototype.hullPolygon = function () {
        var polygon = new Polygon();
        this.renderHull(polygon);
        return polygon.value();
    };
    Delaunay.prototype.renderTriangle = function (i, context) {
        var buffer = context == null ? (context = new Path()) : undefined;
        var _a = this, points = _a.points, triangles = _a.triangles;
        var t0 = triangles[(i *= 3)] * 2;
        var t1 = triangles[i + 1] * 2;
        var t2 = triangles[i + 2] * 2;
        context.moveTo(points[t0], points[t0 + 1]);
        context.lineTo(points[t1], points[t1 + 1]);
        context.lineTo(points[t2], points[t2 + 1]);
        context.closePath();
        return buffer && buffer.value();
    };
    Delaunay.prototype.trianglePolygons = function () {
        var triangles, i, n;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    triangles = this.triangles;
                    i = 0, n = triangles.length / 3;
                    _a.label = 1;
                case 1:
                    if (!(i < n)) return [3, 4];
                    return [4, this.trianglePolygon(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    ++i;
                    return [3, 1];
                case 4: return [2];
            }
        });
    };
    Delaunay.prototype.trianglePolygon = function (i) {
        var polygon = new Polygon();
        this.renderTriangle(i, polygon);
        return polygon.value();
    };
    return Delaunay;
}());
exports.Delaunay = Delaunay;
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
    var i, points_1, points_1_1, p, e_2_1;
    var e_2, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                i = 0;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, 8, 9]);
                points_1 = __values(points), points_1_1 = points_1.next();
                _b.label = 2;
            case 2:
                if (!!points_1_1.done) return [3, 6];
                p = points_1_1.value;
                return [4, fx.call(that, p, i, points)];
            case 3:
                _b.sent();
                return [4, fy.call(that, p, i, points)];
            case 4:
                _b.sent();
                ++i;
                _b.label = 5;
            case 5:
                points_1_1 = points_1.next();
                return [3, 2];
            case 6: return [3, 9];
            case 7:
                e_2_1 = _b.sent();
                e_2 = { error: e_2_1 };
                return [3, 9];
            case 8:
                try {
                    if (points_1_1 && !points_1_1.done && (_a = points_1.return)) _a.call(points_1);
                }
                finally { if (e_2) throw e_2.error; }
                return [7];
            case 9: return [2];
        }
    });
}
//# sourceMappingURL=index.js.map