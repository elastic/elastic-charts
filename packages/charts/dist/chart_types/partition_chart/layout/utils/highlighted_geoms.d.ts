import { $Values as Values } from 'utility-types';
/** @public */
export declare const LegendStrategy: Readonly<{
    /**
     * Highlight the specific node(s) that the legend item stands for.
     */
    Node: "node";
    /**
     * Highlight members of the exact path; ie. like `Node`, plus all its ancestors
     */
    Path: "path";
    /**
     * Highlight all identically named (labelled) items within the tree layer (depth or ring) of the specific node(s) that the legend item stands for
     */
    KeyInLayer: "keyInLayer";
    /**
     * Highlight all identically named (labelled) items, no matter where they are
     */
    Key: "key";
    /**
     * Highlight the specific node(s) that the legend item stands for, plus all descendants
     */
    NodeWithDescendants: "nodeWithDescendants";
    /**
     * Highlight the specific node(s) that the legend item stands for, plus all ancestors and descendants
     */
    PathWithDescendants: "pathWithDescendants";
}>;
/** @public */
export type LegendStrategy = Values<typeof LegendStrategy>;
//# sourceMappingURL=highlighted_geoms.d.ts.map