"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipeline = exports.executing = exports.filter = exports.map = exports.filtering = exports.doing = exports.mapping = void 0;
function mapping(fun) {
    return function* (iterable) {
        for (const next of iterable)
            yield fun(next);
    };
}
exports.mapping = mapping;
function doing(fun) {
    return function* (iterable) {
        for (const next of iterable)
            fun(next);
    };
}
exports.doing = doing;
function filtering(fun) {
    return function* (iterable) {
        for (const next of iterable) {
            if (fun(next))
                yield next;
        }
    };
}
exports.filtering = filtering;
function map(iterable, fun) {
    return mapping(fun)(iterable);
}
exports.map = map;
function filter(iterable, fun) {
    return filtering(fun)(iterable);
}
exports.filter = filter;
function executing(iterable) {
    const iterator = iterable[Symbol.iterator]();
    while (!iterator.next().done) { }
}
exports.executing = executing;
function pipeline(arg, ...functions) {
    return functions.reduce((iterator, fun) => fun(iterator), arg);
}
exports.pipeline = pipeline;
//# sourceMappingURL=iterables.js.map