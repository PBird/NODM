export = Index;
/**
 * Indexes on field names, with atomic operations and which can optionally enforce a unique constraint or allow indexed
 * fields to be undefined
 * @private
 */
declare class Index {
    /**
     * Create a new index
     * All methods on an index guarantee that either the whole operation was successful and the index changed
     * or the operation was unsuccessful and an error is thrown while the index is unchanged
     * @param {object} options
     * @param {string} options.fieldName On which field should the index apply, can use dot notation to index on sub fields, can use comma-separated notation to use compound indexes
     * @param {boolean} [options.unique = false] Enforces a unique constraint
     * @param {boolean} [options.sparse = false] Allows a sparse index (we can have documents for which fieldName is `undefined`)
     */
    constructor(options: {
        fieldName: string;
        unique?: boolean;
        sparse?: boolean;
    });
    /**
     * On which field the index applies to, can use dot notation to index on sub fields, can use comma-separated notation to use compound indexes.
     * @type {string}
     */
    fieldName: string;
    /**
     * Internal property which is an Array representing the fieldName split with `,`, useful only for compound indexes.
     * @type {string[]}
     * @private
     */
    private _fields;
    /**
     * Defines if the index enforces a unique constraint for this index.
     * @type {boolean}
     */
    unique: boolean;
    /**
     * Defines if we can have documents for which fieldName is `undefined`
     * @type {boolean}
     */
    sparse: boolean;
    /**
     * Options object given to the underlying BinarySearchTree.
     * @type {{unique: boolean, checkValueEquality: (function(*, *): boolean), compareKeys: ((function(*, *, compareStrings): (number|number))|*)}}
     */
    treeOptions: {
        unique: boolean;
        checkValueEquality: ((arg0: any, arg1: any) => boolean);
        compareKeys: (((arg0: any, arg1: any, arg2: compareStrings) => (number | number)) | any);
    };
    /**
     * Underlying BinarySearchTree for this index. Uses an AVLTree for optimization.
     * @type {AVLTree}
     */
    tree: AVLTree;
    /**
     * Reset an index
     * @param {?document|?document[]} [newData] Data to initialize the index with. If an error is thrown during
     * insertion, the index is not modified.
     */
    reset(newData?: (Document | (Document[] | null)) | null): void;
    /**
     * Insert a new document in the index
     * If an array is passed, we insert all its elements (if one insertion fails the index is not modified)
     * O(log(n))
     * @param {document|document[]} doc The document, or array of documents, to insert.
     */
    insert(doc: Document | Document[]): void;
    /**
     * Insert an array of documents in the index
     * If a constraint is violated, the changes should be rolled back and an error thrown
     * @param {document[]} docs Array of documents to insert.
     * @private
     */
    private insertMultipleDocs;
    /**
     * Removes a document from the index.
     * If an array is passed, we remove all its elements
     * The remove operation is safe with regards to the 'unique' constraint
     * O(log(n))
     * @param {document[]|document} doc The document, or Array of documents, to remove.
     */
    remove(doc: Document[] | Document): void;
    /**
     * Update a document in the index
     * If a constraint is violated, changes are rolled back and an error thrown
     * Naive implementation, still in O(log(n))
     * @param {document|Array.<{oldDoc: document, newDoc: document}>} oldDoc Document to update, or an `Array` of
     * `{oldDoc, newDoc}` pairs.
     * @param {document} [newDoc] Document to replace the oldDoc with. If the first argument is an `Array` of
     * `{oldDoc, newDoc}` pairs, this second argument is ignored.
     */
    update(oldDoc: Document | Array<{
        oldDoc: Document;
        newDoc: Document;
    }>, newDoc?: Document): void;
    /**
     * Update multiple documents in the index
     * If a constraint is violated, the changes need to be rolled back
     * and an error thrown
     * @param {Array.<{oldDoc: document, newDoc: document}>} pairs
     *
     * @private
     */
    private updateMultipleDocs;
    /**
     * Revert an update
     * @param {document|Array.<{oldDoc: document, newDoc: document}>} oldDoc Document to revert to, or an `Array` of `{oldDoc, newDoc}` pairs.
     * @param {document} [newDoc] Document to revert from. If the first argument is an Array of {oldDoc, newDoc}, this second argument is ignored.
     */
    revertUpdate(oldDoc: Document | Array<{
        oldDoc: Document;
        newDoc: Document;
    }>, newDoc?: Document): void;
    /**
     * Get all documents in index whose key match value (if it is a Thing) or one of the elements of value (if it is an array of Things)
     * @param {Array.<*>|*} value Value to match the key against
     * @return {document[]}
     */
    getMatching(value: Array<any> | any): Document[];
    /**
     * Get all documents in index whose key is between bounds are they are defined by query
     * Documents are sorted by key
     * @param {object} query An object with at least one matcher among $gt, $gte, $lt, $lte.
     * @param {*} [query.$gt] Greater than matcher.
     * @param {*} [query.$gte] Greater than or equal matcher.
     * @param {*} [query.$lt] Lower than matcher.
     * @param {*} [query.$lte] Lower than or equal matcher.
     * @return {document[]}
     */
    getBetweenBounds(query: {
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }): Document[];
    /**
     * Get all elements in the index
     * @return {document[]}
     */
    getAll(): Document[];
}
