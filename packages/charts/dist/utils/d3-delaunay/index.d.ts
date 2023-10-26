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
/**
 * Delaunay triangulation
 */
interface DelaunayI<P> {
    /**
     * The coordinates of the points as an array [x0, y0, x1, y1, ...].
     * Typically, this is a Float64Array, however you can use any array-like type in the constructor.
     */
    points: ArrayLike<number>;
    /**
     * The halfedge indices as an Int32Array [j0, j1, ...].
     * For each index 0 <= i < halfedges.length, there is a halfedge from triangle vertex j = halfedges[i] to triangle vertex i.
     */
    halfedges: Int32Array;
    /**
     * An arbitrary node on the convex hull.
     * The convex hull is represented as a circular doubly-linked list of nodes.
     */
    hull: Node;
    /**
     * The triangle vertex indices as an Uint32Array [i0, j0, k0, i1, j1, k1, ...].
     * Each contiguous triplet of indices i, j, k forms a counterclockwise triangle.
     * The coordinates of the triangle's points can be found by going through 'points'.
     */
    triangles: Uint32Array;
    /**
     * The incoming halfedge indexes as a Int32Array [e0, e1, e2, ...].
     * For each point i, inedges[i] is the halfedge index e of an incoming halfedge.
     * For coincident points, the halfedge index is -1; for points on the convex hull, the incoming halfedge is on the convex hull; for other points, the choice of incoming halfedge is arbitrary.
     */
    inedges: Int32Array;
    /**
     * The outgoing halfedge indexes as a Int32Array [e0, e1, e2, ...].
     * For each point i on the convex hull, outedges[i] is the halfedge index e of the corresponding outgoing halfedge; for other points, the halfedge index is -1.
     */
    outedges: Int32Array;
    /**
     * Returns the index of the input point that is closest to the specified point ⟨x, y⟩.
     * The search is started at the specified point i. If i is not specified, it defaults to zero.
     */
    find(x: number, y: number, i?: number): number;
    /**
     * Returns an iterable over the indexes of the neighboring points to the specified point i.
     * The iterable is empty if i is a coincident point.
     */
    neighbors(i: number): IterableIterator<number>;
    /**
     * Returns the closed polygon [[x0, y0], [x1, y1], ..., [x0, y0]] representing the convex hull.
     */
    hullPolygon(): Polygon;
    /**
     * Returns the closed polygon [[x0, y0], [x1, y1], [x2, y2], [x0, y0]] representing the triangle i.
     */
    trianglePolygon(i: number): Triangle;
    /**
     * Returns an iterable over the polygons for each triangle, in order.
     */
    trianglePolygons(): IterableIterator<Triangle>;
    /**
     * Returns the Voronoi diagram for the associated points.
     * When rendering, the diagram will be clipped to the specified bounds = [xmin, ymin, xmax, ymax].
     * If bounds is not specified, it defaults to [0, 0, 960, 500].
     * See To Infinity and Back Again for an interactive explanation of Voronoi cell clipping.
     */
    voronoi(bounds?: Bounds): Voronoi<P>;
}
/**
 * A point represented as an array tuple [x, y].
 */
type Point = number[];
/**
 * A closed polygon [[x0, y0], [x1, y1], [x2, y2], [x0, y0]] representing a triangle.
 */
type Triangle = Point[];
/**
 * A closed polygon [[x0, y0], [x1, y1], ..., [x0, y0]].
 */
type PolygonI = Point[];
/**
 * A rectangular area [x, y, width, height].
 */
export type Bounds = number[];
/**
 * A function to extract a x- or y-coordinate from the specified point.
 */
type GetCoordinate<P, PS> = (point: P, i: number, points: PS) => number;
/**
 * A point node on a convex hull (represented as a circular linked list).
 */
interface Node {
    /**
     * The index of the associated point.
     */
    i: number;
    /**
     * The x-coordinate of the associated point.
     */
    x: number;
    /**
     * The y-coordinate of the associated point.
     */
    y: number;
    /**
     * The index of the (incoming or outgoing?) associated halfedge.
     */
    t: number;
    /**
     * The previous node on the hull.
     */
    prev: Node;
    /**
     * The next node on the hull.
     */
    next: Node;
    /**
     * Whether the node has been removed from the linked list.
     */
    removed: boolean;
}
/**
 * An interface for the rect() method of the CanvasPathMethods API.
 */
interface RectContext {
    /**
     * rect() method of the CanvasPathMethods API.
     */
    rect(x: number, y: number, width: number, height: number): void;
}
/**
 * An interface for the moveTo() method of the CanvasPathMethods API.
 */
interface MoveContext {
    /**
     * moveTo() method of the CanvasPathMethods API.
     */
    moveTo(x: number, y: number): void;
}
/**
 * An interface for the lineTo() method of the CanvasPathMethods API.
 */
interface LineContext {
    /**
     * lineTo() method of the CanvasPathMethods API.
     */
    lineTo(x: number, y: number): void;
}
/**
 * An interface for the arc() method of the CanvasPathMethods API.
 */
interface ArcContext {
    /**
     * arc() method of the CanvasPathMethods API.
     */
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
}
/**
 * An interface for the closePath() method of the CanvasPathMethods API.
 */
interface ClosableContext {
    /**
     * closePath() method of the CanvasPathMethods API.
     */
    closePath(): void;
}
/**
 * Voronoi regions
 */
interface VoronoiI<P> {
    /**
     * The Voronoi diagram’s associated Delaunay triangulation.
     */
    delaunay: DelaunayI<P>;
    /**
     * The circumcenters of the Delaunay triangles [cx0, cy0, cx1, cy1, ...].
     * Each contiguous pair of coordinates cx, cy is the circumcenter for the corresponding triangle.
     * These circumcenters form the coordinates of the Voronoi cell polygons.
     */
    circumcenters: Float64Array;
    /**
     * An array [vx0, vy0, wx0, wy0, ...] where each non-zero quadruple describes an open (infinite) cell
     * on the outer hull, giving the directions of two open half-lines.
     */
    vectors: Float64Array;
    /**
     * The bounds of the viewport [xmin, ymin, xmax, ymax] for rendering the Voronoi diagram.
     * These values only affect the rendering methods (voronoi.render, voronoi.renderBounds, cell.render).
     */
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    /**
     * Returns true if the cell with the specified index i contains the specified point ⟨x, y⟩.
     * (This method is not affected by the associated Voronoi diagram’s viewport bounds.)
     */
    contains(i: number, x: number, y: number): boolean;
    /**
     * Returns the convex, closed polygon [[x0, y0], [x1, y1], ..., [x0, y0]] representing the cell for the specified point i.
     */
    cellPolygon(i: number): PolygonI;
    /**
     * Returns an iterable over the polygons for each cell, in order.
     */
    cellPolygons(): IterableIterator<PolygonI>;
}
declare class Polygon {
    constructor();
    moveTo(x: any, y: any): void;
    closePath(): void;
    lineTo(x: any, y: any): void;
    value(): any;
}
export declare class Voronoi<P> implements VoronoiI<P> {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    /**
     * The Voronoi diagram’s associated Delaunay triangulation.
     */
    delaunay: DelaunayI<P>;
    /**
     * The circumcenters of the Delaunay triangles [cx0, cy0, cx1, cy1, ...].
     * Each contiguous pair of coordinates cx, cy is the circumcenter for the corresponding triangle.
     * These circumcenters form the coordinates of the Voronoi cell polygons.
     */
    circumcenters: Float64Array;
    /**
     * An array [vx0, vy0, wx0, wy0, ...] where each non-zero quadruple describes an open (infinite) cell
     * on the outer hull, giving the directions of two open half-lines.
     */
    vectors: Float64Array;
    constructor(delaunay: DelaunayI<P>, [xmin, ymin, xmax, ymax]?: Bounds);
    update(): this;
    _init(): void;
    /**
     * Renders the mesh of Voronoi cells to the specified context.
     * The specified context must implement the context.moveTo and context.lineTo methods from the CanvasPathMethods API.
     */
    render(context: MoveContext & LineContext): void;
    /**
     * Renders the viewport extent to the specified context.
     * The specified context must implement the context.rect method from the CanvasPathMethods API.
     * Equivalent to context.rect(voronoi.xmin, voronoi.ymin, voronoi.xmax - voronoi.xmin, voronoi.ymax - voronoi.ymin).
     */
    renderBounds(context: RectContext): void;
    /**
     * Renders the cell with the specified index i to the specified context.
     * The specified context must implement the context.moveTo, context.lineTo, and context.closePath methods from the CanvasPathMethods API.
     */
    renderCell(i: number, context: MoveContext & LineContext & ClosableContext): void;
    cellPolygons(): Generator<any, void, unknown>;
    cellPolygon(i: any): any;
    _renderSegment(x0: any, y0: any, x1: any, y1: any, context: any): void;
    contains(i: any, x: any, y: any): boolean;
    neighbors(i: any): Generator<number, void, unknown>;
    _cell(i: any): (number | undefined)[] | null;
    _clip(i: any): any[] | null;
    _clipFinite(i: any, points: any): any[] | null;
    _clipSegment(x0: any, y0: any, x1: any, y1: any, c0: any, c1: any): any[] | null;
    _clipInfinite(i: any, points: any, vx0: any, vy0: any, vxn: any, vyn: any): unknown[];
    _edge(i: any, e0: any, e1: any, P: any, j: any): any;
    _project(x0: any, y0: any, vx: any, vy: any): any[] | null;
    _edgecode(x: any, y: any): number;
    _regioncode(x: any, y: any): number;
}
export declare class Delaunay<P> implements DelaunayI<P> {
    /**
     * The coordinates of the points as an array [x0, y0, x1, y1, ...].
     * Typically, this is a Float64Array, however you can use any array-like type in the constructor.
     */
    points: ArrayLike<number>;
    /**
     * The halfedge indices as an Int32Array [j0, j1, ...].
     * For each index 0 <= i < halfedges.length, there is a halfedge from triangle vertex j = halfedges[i] to triangle vertex i.
     */
    halfedges: Int32Array;
    /**
     * An arbitrary node on the convex hull.
     * The convex hull is represented as a circular doubly-linked list of nodes.
     */
    hull: Node;
    /**
     * The triangle vertex indices as an Uint32Array [i0, j0, k0, i1, j1, k1, ...].
     * Each contiguous triplet of indices i, j, k forms a counterclockwise triangle.
     * The coordinates of the triangle's points can be found by going through 'points'.
     */
    triangles: Uint32Array;
    /**
     * The incoming halfedge indexes as a Int32Array [e0, e1, e2, ...].
     * For each point i, inedges[i] is the halfedge index e of an incoming halfedge.
     * For coincident points, the halfedge index is -1; for points on the convex hull, the incoming halfedge is on the convex hull; for other points, the choice of incoming halfedge is arbitrary.
     */
    inedges: Int32Array;
    /**
     * The outgoing halfedge indexes as a Int32Array [e0, e1, e2, ...].
     * For each point i on the convex hull, outedges[i] is the halfedge index e of the corresponding outgoing halfedge; for other points, the halfedge index is -1.
     */
    outedges: Int32Array;
    /**
     * Returns the Delaunay triangulation for the given array or iterable of points.
     * Otherwise, the getX and getY functions are invoked for each point in order, and must return the respective x- and y-coordinate for each point.
     * If that is specified, the functions getX and getY are invoked with that as this.
     * (See Array.from for reference.)
     */
    static from<P>(points: ArrayLike<P> | Iterable<P>, fx?: GetCoordinate<P, ArrayLike<P> | Iterable<P>>, fy?: GetCoordinate<P, ArrayLike<P> | Iterable<P>>, that?: any): Delaunay<P>;
    /**
     * Returns the Delaunay triangulation for the given flat array [x0, y0, x1, y1, …] of points.
     */
    constructor(points: ArrayLike<number>);
    update(): this;
    _init(): void;
    voronoi(bounds: any): any;
    neighbors(i: any): Generator<any, void, unknown>;
    find(x: any, y: any, i?: number): any;
    _step(i: any, x: any, y: any): any;
    /**
     * Renders the edges of the Delaunay triangulation to the specified context.
     * The specified context must implement the context.moveTo and context.lineTo methods from the CanvasPathMethods API.
     */
    render(context: MoveContext & LineContext): void;
    /**
     * Renders the input points of the Delaunay triangulation to the specified context as circles with the specified radius.
     * If radius is not specified, it defaults to 2.
     * The specified context must implement the context.moveTo and context.arc methods from the CanvasPathMethods API.
     */
    renderPoints(context: MoveContext & ArcContext, r?: number): void;
    /**
     * Renders the convex hull of the Delaunay triangulation to the specified context.
     * The specified context must implement the context.moveTo and context.lineTo methods from the CanvasPathMethods API.
     */
    renderHull(context: MoveContext & LineContext): void;
    hullPolygon(): any;
    /**
     * Renders triangle i of the Delaunay triangulation to the specified context.
     * The specified context must implement the context.moveTo, context.lineTo and context.closePath methods from the CanvasPathMethods API.
     */
    renderTriangle(i: number, context: MoveContext & LineContext & ClosableContext): void;
    trianglePolygons(): Generator<any, void, unknown>;
    trianglePolygon(i: any): any;
}
export {};
//# sourceMappingURL=index.d.ts.map