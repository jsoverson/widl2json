#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import { parse } from '@wapc/widl';
import * as ast from '@wapc/widl/ast';

interface Arguments {
  file: string;
  terse: boolean;
  pretty: boolean;
}

export function run(args: Arguments): void {
  const path = args.file;
  const widl = fs.readFileSync(path, 'utf-8');
  const tree = parse(widl, undefined, { noLocation: true, noSource: true });
  const json = toJson(tree, args.terse, args.pretty);
  console.log(json);
}

type Replacer = (this: unknown, key: string, value: unknown) => unknown;

function toJson(widldoc: ast.Document, terse: boolean, pretty: boolean): string {
  const replacer: Replacer | undefined = terse
    ? (k: string, v: unknown) => (Array.isArray(v) && v.length == 0 ? undefined : v)
    : undefined;
  return JSON.stringify(widldoc, replacer, pretty ? 2 : undefined);
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
