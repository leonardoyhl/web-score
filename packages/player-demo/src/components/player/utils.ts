import { xml2json, Options } from 'xml-js';

export function xmlToJson(xml: string, options: Options.XML2JSON) {
  return JSON.parse(xml2json(xml, Object.assign({compact: true}, options)));
}
