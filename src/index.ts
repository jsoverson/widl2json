#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import { parse } from '@wapc/widl';
import * as ast from '@wapc/widl/ast';

interface Arguments {
  file: string;
  terse: boolean;
  pretty: boolean;
  condensed: boolean;
}

export function run(args: Arguments): void {
  const path = args.file;
  const widl = fs.readFileSync(path, 'utf-8');
  const tree = parse(widl, undefined, { noLocation: true, noSource: true });
  const json = toJson(args.condensed ? condense(tree) : tree, args.terse, args.pretty);
  console.log(json);
}

function kindToKey(kind: string): string {
  kind = kind.replace('Definition', '');
  return kind.substr(0, 1).toLowerCase() + kind.substr(1) + 's';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function condense(obj: any): any {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return undefined;
    const allNamed = obj.filter(val => val?.name?.kind !== 'Name').length === 0;

    if (allNamed) {
      const entries = obj.map(val => [val.name.value, condense(val)]);
      return Object.fromEntries(entries);
    } else {
      return obj;
    }
  } else {
    if (typeof obj === 'object' && obj !== null) {
      if (obj.kind === 'Document') {
        // condense the Document's definitions and uplevel them to the root.
        const definitions = obj.definitions;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type Namespace = Record<string, any>;
        const defaultNamespace: Namespace = { namespace: '<none>' };
        let currentNamespace = defaultNamespace;
        const namespaces: Array<Namespace> = [];
        for (const value of definitions) {
          if (value.kind === ast.Kind.NamespaceDefinition) {
            currentNamespace = { namespace: value.name.value };
            namespaces.push(currentNamespace);
          } else {
            const key = kindToKey(value.kind);
            if (!currentNamespace[key]) currentNamespace[key] = [];
            currentNamespace[key].push(condense(value));
          }
        }
        if (Object.keys(defaultNamespace).length > 1) namespaces.unshift(defaultNamespace);
        return { namespaces };
      } else if (obj.kind === 'StringValue') {
        // Remove "StringValue" nodes
        return obj.value;
      } else if (obj.kind === 'Name') {
        // Remove "Name" nodes
        return obj.value;
      } else if (obj.kind === 'Named') {
        if (obj.name.kind === 'Name') {
          // Remove "Named" nodes with a value of the inner Name or...
          return obj.name.value;
        } else {
          // Whatever object exists as the name.
          return obj.name;
        }
      } else {
        // Recurse into object values
        const keys = Object.keys(obj);
        let altered = false;
        for (const key of keys) {
          const newObj = condense(obj[key]);
          if (obj[key] !== newObj) {
            obj[key] = newObj;
            altered = true;
          }
        }
        // if we modified children then we're not a ".kind" anymore.
        if (altered) delete obj.kind;
        return obj;
      }
    }
    return obj;
  }
}

type Replacer = (this: unknown, key: string, value: unknown) => unknown;

function toJson(obj: any, terse: boolean, pretty: boolean): string {
  const replacer: Replacer | undefined = (k: string, v: unknown) => {
    return Array.isArray(v) && v.length == 0 ? undefined : v;
  };
  return JSON.stringify(obj, replacer, pretty ? 2 : undefined);
}

yargs(process.argv.slice(2))
  .command(
    '$0 <file> [options]',
    'Convert WIDL schemas to JSON',
    yargs => {
      yargs
        .positional('file', {
          demandOption: true,
          type: 'string',
          description: 'Path to schema file',
        })
        .example('$0 schema.widl --pretty', 'Outputs pretty-printed JSON')
        .option('t', {
          alias: 'terse',
          description: 'Omit empty arrays from the JSON',
          default: false,
          type: 'boolean',
        })
        .option('c', {
          alias: 'condensed',
          description: 'Condense JSON into a structure more suitable for templates',
          default: false,
          type: 'boolean',
        })
        .option('p', {
          alias: 'pretty',
          description: 'Pretty print the JSON output',
          default: false,
          type: 'boolean',
        });
    },
    run,
  )
  .help('h')
  .alias('h', 'help').argv;
