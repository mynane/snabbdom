import {VNode, VNodeData} from '../vnode';
import {Module} from './module';

export type Attrs = Record<string, string | number | boolean>

const booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare",
                "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable",
                "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple",
                "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly",
                "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate",
                "truespeed", "typemustmatch", "visible"];

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const colonChar = 58;
const xChar = 120;
const booleanAttrsDict: {[attribute: string]: boolean} = Object.create(null);

for (let i = 0, len = booleanAttrs.length; i < len; i++) {
  booleanAttrsDict[booleanAttrs[i]] = true;
}

function updateAttrs(oldVnode: VNode, vnode: VNode): void {
  var key: string, elm: Element = vnode.elm as Element,
      oldAttrs = (oldVnode.data as VNodeData).attrs,
      attrs = (vnode.data as VNodeData).attrs;

  if (!oldAttrs && !attrs) return;
  if (oldAttrs === attrs) return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};

  // update modified attributes, add new attributes
  for (key in attrs) {
    const cur = attrs[key];
    const old = oldAttrs[key];
    if (old !== cur) {
      if (booleanAttrsDict[key]) {
        if (cur) {
          elm.setAttribute(key, "");
        } else {
          elm.removeAttribute(key);
        }
      } else {
        // because those in TypeScript are too restrictive: https://github.com/Microsoft/TSJS-lib-generator/pull/237
        type SetAttribute = (name: string, value: string | number | boolean) => void;
        type SetAttributeNS = (namespaceURI: string, qualifiedName: string, value: string | number | boolean) => void;
        if (key.charCodeAt(0) !== xChar) {
          (elm.setAttribute as SetAttribute)(key, cur);
        } else if (key.charCodeAt(3) === colonChar) {
          // Assume xml namespace
          (elm.setAttributeNS as SetAttributeNS)(xmlNS, key, cur);
        } else if (key.charCodeAt(5) === colonChar) {
          // Assume xlink namespace
          (elm.setAttributeNS as SetAttributeNS)(xlinkNS, key, cur);
        } else {
          (elm.setAttribute as SetAttribute)(key, cur);
        }
      }
    }
  }
  // remove removed attributes
  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}

export const attributesModule = {create: updateAttrs, update: updateAttrs} as Module;
export default attributesModule;
