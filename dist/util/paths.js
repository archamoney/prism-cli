"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prism_http_1 = require("@stoplight/prism-http");
const types_1 = require("@stoplight/types");
const E = require("fp-ts/lib/Either");
const A = require("fp-ts/lib/Array");
const pipeable_1 = require("fp-ts/lib/pipeable");
const Do_1 = require("fp-ts-contrib/lib/Do");
const lodash_1 = require("lodash");
const uri_template_lite_1 = require("uri-template-lite");
const Apply_1 = require("fp-ts/lib/Apply");
const traverseEither = A.array.traverse(E.either);
const sequenceSEither = Apply_1.sequenceS(E.either);
const DoEither = Do_1.Do(E.either);
function createExamplePath(operation, transformValues = lodash_1.identity) {
    return DoEither.bind('pathData', generateTemplateAndValuesForPathParams(operation))
        .bindL('queryData', ({ pathData }) => generateTemplateAndValuesForQueryParams(pathData.template, operation))
        .return(({ pathData, queryData }) => uri_template_lite_1.URI.expand(queryData.template, transformValues({ ...pathData.values, ...queryData.values })));
}
exports.createExamplePath = createExamplePath;
function generateParamValue(spec) {
    return pipeable_1.pipe(prism_http_1.generateHttpParam(spec), E.fromOption(() => new Error(`Cannot generate value for: ${spec.name}`)), E.chain(value => {
        switch (spec.style) {
            case types_1.HttpParamStyles.DeepObject:
                return pipeable_1.pipe(value, E.fromPredicate((value) => typeof value === 'string' || typeof value === 'object', () => new Error('Expected string parameter')), E.map(value => prism_http_1.serializeWithDeepObjectStyle(spec.name, value)));
            case types_1.HttpParamStyles.PipeDelimited:
                return pipeable_1.pipe(value, E.fromPredicate(Array.isArray, () => new Error('Pipe delimited style is only applicable to array parameter')), E.map(v => prism_http_1.serializeWithPipeDelimitedStyle(spec.name, v, spec.explode)));
            case types_1.HttpParamStyles.SpaceDelimited:
                return pipeable_1.pipe(value, E.fromPredicate(Array.isArray, () => new Error('Space delimited style is only applicable to array parameter')), E.map(v => prism_http_1.serializeWithSpaceDelimitedStyle(spec.name, v, spec.explode)));
            default:
                return E.right(value);
        }
    }));
}
function generateParamValues(specs) {
    return pipeable_1.pipe(traverseEither(specs, spec => pipeable_1.pipe(generateParamValue(spec), E.map(value => [spec.name, value]))), E.map(lodash_1.fromPairs));
}
function generateTemplateAndValuesForPathParams(operation) {
    const specs = lodash_1.get(operation, 'request.path', []);
    return sequenceSEither({
        values: generateParamValues(specs),
        template: createPathUriTemplate(operation.path, specs),
    });
}
function generateTemplateAndValuesForQueryParams(template, operation) {
    const specs = lodash_1.get(operation, 'request.query', []);
    return pipeable_1.pipe(generateParamValues(specs), E.map(values => ({ template: createQueryUriTemplate(template, specs), values })));
}
function createPathUriTemplate(inputPath, specs) {
    return pipeable_1.pipe(traverseEither(specs.filter(spec => spec.required !== false), spec => pipeable_1.pipe(createParamUriTemplate(spec.name, spec.style || types_1.HttpParamStyles.Simple, spec.explode || false), E.map(param => ({ param, name: spec.name })))), E.map(values => values.reduce((acc, current) => acc.replace(`{${current.name}}`, current.param), inputPath)));
}
function createParamUriTemplate(name, style, explode) {
    const starOrVoid = explode ? '*' : '';
    switch (style) {
        case types_1.HttpParamStyles.Simple:
            return E.right(`{${name}${starOrVoid}}`);
        case types_1.HttpParamStyles.Label:
            return E.right(`{.${name}${starOrVoid}}`);
        case types_1.HttpParamStyles.Matrix:
            return E.right(`{;${name}${starOrVoid}}`);
        default:
            return E.left(new Error(`Unsupported parameter style: ${style}`));
    }
}
function createQueryUriTemplate(path, specs) {
    const formSpecs = specs.filter(spec => (spec.style || types_1.HttpParamStyles.Form) === types_1.HttpParamStyles.Form);
    const formExplodedParams = formSpecs
        .filter(spec => spec.required !== false)
        .filter(spec => spec.explode)
        .map(spec => spec.name)
        .join(',');
    const formImplodedParams = formSpecs
        .filter(spec => spec.required !== false)
        .filter(spec => !spec.explode)
        .map(spec => spec.name)
        .join(',');
    const restParams = specs
        .filter(spec => spec.required !== false)
        .filter(spec => [types_1.HttpParamStyles.DeepObject, types_1.HttpParamStyles.SpaceDelimited, types_1.HttpParamStyles.PipeDelimited].includes(spec.style))
        .map(spec => spec.name)
        .map(name => `{+${name}}`)
        .join('&');
    if (formExplodedParams) {
        path += `{?${formExplodedParams}*}`;
    }
    if (formImplodedParams) {
        path += `{${formExplodedParams ? '&' : '?'}${formImplodedParams}}`;
    }
    if (restParams) {
        path += `${formExplodedParams || formImplodedParams ? '&' : '?'}${restParams}`;
    }
    return path;
}
