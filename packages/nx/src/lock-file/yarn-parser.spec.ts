import { joinPathFragments } from '../utils/path';
import { parseYarnLockfile, stringifyYarnLockfile } from './yarn-parser';
import { pruneProjectGraph } from './project-graph-pruning';
import { vol } from 'memfs';
import { ProjectGraph } from '../config/project-graph';
import { PackageJson } from '../utils/package-json';

jest.mock('fs', () => require('memfs').fs);

jest.mock('@nrwl/devkit', () => ({
  ...jest.requireActual<any>('@nrwl/devkit'),
  workspaceRoot: '/root',
}));

jest.mock('nx/src/utils/workspace-root', () => ({
  workspaceRoot: '/root',
}));

describe('yarn LockFile utility', () => {
  afterEach(() => {
    vol.reset();
  });

  describe('next.js generated', () => {
    beforeEach(() => {
      const fileSys = {
        'node_modules/@jest/reporters/package.json': '{"version": "28.1.1"}',
        'node_modules/@jest/test-result/package.json': '{"version": "28.1.3"}',
        'node_modules/@jridgewell/gen-mapping/package.json':
          '{"version": "0.3.2"}',
        'node_modules/@jridgewell/trace-mapping/package.json':
          '{"version": "0.3.17"}',
        'node_modules/@rollup/pluginutils/package.json': '{"version": "3.1.0"}',
        'node_modules/@swc/helpers/package.json': '{"version": "0.4.11"}',
        'node_modules/@types/estree/package.json': '{"version": "1.0.0"}',
        'node_modules/@types/node/package.json': '{"version": "18.11.9"}',
        'node_modules/@types/react/package.json': '{"version": "18.0.25"}',
        'node_modules/acorn-walk/package.json': '{"version": "8.2.0"}',
        'node_modules/acorn/package.json': '{"version": "8.8.1"}',
        'node_modules/ajv-keywords/package.json': '{"version": "3.5.2"}',
        'node_modules/ajv/package.json': '{"version": "6.12.6"}',
        'node_modules/ansi-styles/package.json': '{"version": "4.3.0"}',
        'node_modules/argparse/package.json': '{"version": "2.0.1"}',
        'node_modules/aria-query/package.json': '{"version": "4.2.2"}',
        'node_modules/array-flatten/package.json': '{"version": "1.1.1"}',
        'node_modules/array-union/package.json': '{"version": "2.1.0"}',
        'node_modules/async/package.json': '{"version": "3.2.4"}',
        'node_modules/babel-jest/package.json': '{"version": "28.1.1"}',
        'node_modules/bluebird/package.json': '{"version": "3.7.2"}',
        'node_modules/brace-expansion/package.json': '{"version": "1.1.11"}',
        'node_modules/bytes/package.json': '{"version": "3.1.2"}',
        'node_modules/camelcase/package.json': '{"version": "6.3.0"}',
        'node_modules/chalk/package.json': '{"version": "4.1.2"}',
        'node_modules/cliui/package.json': '{"version": "7.0.4"}',
        'node_modules/color-convert/package.json': '{"version": "2.0.1"}',
        'node_modules/color-name/package.json': '{"version": "1.1.4"}',
        'node_modules/colorette/package.json': '{"version": "2.0.19"}',
        'node_modules/commander/package.json': '{"version": "5.1.0"}',
        'node_modules/core-util-is/package.json': '{"version": "1.0.2"}',
        'node_modules/cosmiconfig/package.json': '{"version": "7.1.0"}',
        'node_modules/cssom/package.json': '{"version": "0.5.0"}',
        'node_modules/debug/package.json': '{"version": "4.3.4"}',
        'node_modules/depd/package.json': '{"version": "2.0.0"}',
        'node_modules/diff-sequences/package.json': '{"version": "28.1.1"}',
        'node_modules/doctrine/package.json': '{"version": "2.1.0"}',
        'node_modules/emoji-regex/package.json': '{"version": "9.2.2"}',
        'node_modules/entities/package.json': '{"version": "4.4.0"}',
        'node_modules/escape-string-regexp/package.json':
          '{"version": "1.0.5"}',
        'node_modules/eslint-scope/package.json': '{"version": "5.1.1"}',
        'node_modules/eslint-visitor-keys/package.json': '{"version": "3.3.0"}',
        'node_modules/estraverse/package.json': '{"version": "5.3.0"}',
        'node_modules/estree-walker/package.json': '{"version": "2.0.2"}',
        'node_modules/execa/package.json': '{"version": "5.1.1"}',
        'node_modules/extsprintf/package.json': '{"version": "1.3.0"}',
        'node_modules/fast-glob/package.json': '{"version": "3.2.12"}',
        'node_modules/find-up/package.json': '{"version": "4.1.0"}',
        'node_modules/form-data/package.json': '{"version": "4.0.0"}',
        'node_modules/fs-extra/package.json': '{"version": "10.1.0"}',
        'node_modules/get-stream/package.json': '{"version": "5.2.0"}',
        'node_modules/glob-parent/package.json': '{"version": "5.1.2"}',
        'node_modules/glob/package.json': '{"version": "7.2.3"}',
        'node_modules/globals/package.json': '{"version": "11.12.0"}',
        'node_modules/globby/package.json': '{"version": "11.1.0"}',
        'node_modules/has-flag/package.json': '{"version": "4.0.0"}',
        'node_modules/http-errors/package.json': '{"version": "2.0.0"}',
        'node_modules/human-signals/package.json': '{"version": "2.1.0"}',
        'node_modules/iconv-lite/package.json': '{"version": "0.4.24"}',
        'node_modules/inherits/package.json': '{"version": "2.0.4"}',
        'node_modules/ipaddr.js/package.json': '{"version": "2.0.1"}',
        'node_modules/is-plain-object/package.json': '{"version": "2.0.4"}',
        'node_modules/isarray/package.json': '{"version": "2.0.5"}',
        'node_modules/jest-config/package.json': '{"version": "28.1.3"}',
        'node_modules/jest-diff/package.json': '{"version": "28.1.3"}',
        'node_modules/jest-get-type/package.json': '{"version": "28.0.2"}',
        'node_modules/jest-matcher-utils/package.json': '{"version": "28.1.3"}',
        'node_modules/jest-resolve/package.json': '{"version": "28.1.3"}',
        'node_modules/jest-util/package.json': '{"version": "28.1.3"}',
        'node_modules/jest-worker/package.json': '{"version": "28.1.3"}',
        'node_modules/js-yaml/package.json': '{"version": "4.1.0"}',
        'node_modules/jsesc/package.json': '{"version": "2.5.2"}',
        'node_modules/json-schema-traverse/package.json':
          '{"version": "0.4.1"}',
        'node_modules/json5/package.json': '{"version": "2.2.1"}',
        'node_modules/jsonfile/package.json': '{"version": "6.1.0"}',
        'node_modules/levn/package.json': '{"version": "0.4.1"}',
        'node_modules/loader-utils/package.json': '{"version": "2.0.4"}',
        'node_modules/locate-path/package.json': '{"version": "5.0.0"}',
        'node_modules/make-dir/package.json': '{"version": "3.1.0"}',
        'node_modules/minimatch/package.json': '{"version": "3.1.2"}',
        'node_modules/mkdirp/package.json': '{"version": "0.5.6"}',
        'node_modules/ms/package.json': '{"version": "2.0.0"}',
        'node_modules/optionator/package.json': '{"version": "0.9.1"}',
        'node_modules/p-limit/package.json': '{"version": "3.1.0"}',
        'node_modules/p-locate/package.json': '{"version": "4.1.0"}',
        'node_modules/parse5/package.json': '{"version": "6.0.1"}',
        'node_modules/pify/package.json': '{"version": "2.3.0"}',
        'node_modules/pkg-dir/package.json': '{"version": "4.2.0"}',
        'node_modules/postcss/package.json': '{"version": "8.4.20"}',
        'node_modules/prelude-ls/package.json': '{"version": "1.1.2"}',
        'node_modules/pretty-format/package.json': '{"version": "28.1.3"}',
        'node_modules/proxy-from-env/package.json': '{"version": "1.0.0"}',
        'node_modules/qs/package.json': '{"version": "6.11.0"}',
        'node_modules/react-is/package.json': '{"version": "18.2.0"}',
        'node_modules/readable-stream/package.json': '{"version": "3.6.0"}',
        'node_modules/regenerator-runtime/package.json':
          '{"version": "0.13.7"}',
        'node_modules/resolve-from/package.json': '{"version": "5.0.0"}',
        'node_modules/resolve/package.json': '{"version": "1.22.1"}',
        'node_modules/rxjs/package.json': '{"version": "6.6.7"}',
        'node_modules/safe-buffer/package.json': '{"version": "5.2.1"}',
        'node_modules/schema-utils/package.json': '{"version": "3.1.1"}',
        'node_modules/semver/package.json': '{"version": "6.3.0"}',
        'node_modules/setprototypeof/package.json': '{"version": "1.2.0"}',
        'node_modules/slash/package.json': '{"version": "3.0.0"}',
        'node_modules/slice-ansi/package.json': '{"version": "3.0.0"}',
        'node_modules/source-map-support/package.json': '{"version": "0.5.13"}',
        'node_modules/source-map/package.json': '{"version": "0.6.1"}',
        'node_modules/statuses/package.json': '{"version": "2.0.1"}',
        'node_modules/string_decoder/package.json': '{"version": "1.3.0"}',
        'node_modules/strip-bom/package.json': '{"version": "3.0.0"}',
        'node_modules/supports-color/package.json': '{"version": "7.2.0"}',
        'node_modules/tough-cookie/package.json': '{"version": "4.1.2"}',
        'node_modules/tslib/package.json': '{"version": "2.4.1"}',
        'node_modules/type-check/package.json': '{"version": "0.3.2"}',
        'node_modules/type-fest/package.json': '{"version": "0.20.2"}',
        'node_modules/universalify/package.json': '{"version": "2.0.0"}',
        'node_modules/whatwg-url/package.json': '{"version": "10.0.0"}',
        'node_modules/wrap-ansi/package.json': '{"version": "7.0.0"}',
      };
      vol.fromJSON(fileSys, '/root');
    });

    let lockFile;

    let graph: ProjectGraph;

    beforeEach(() => {
      lockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/nextjs/yarn.lock'
      )).default;
      graph = parseYarnLockfile(lockFile);
    });

    it('should parse root lock file', async () => {
      expect(Object.keys(graph.externalNodes).length).toEqual(1244); // 1104
    });

    it('should prune lock file', async () => {
      const appPackageJson = require(joinPathFragments(
        __dirname,
        '__fixtures__/nextjs/app/package.json'
      ));

      // this is our pruned lock file structure
      const prunedGraph = pruneProjectGraph(graph, appPackageJson);
      expect(Object.keys(prunedGraph.externalNodes).length).toEqual(864);
      const result = stringifyYarnLockfile(
        prunedGraph,
        lockFile,
        appPackageJson
      );
      expect(result).toEqual(
        require(joinPathFragments(
          __dirname,
          '__fixtures__/nextjs/app/yarn.lock'
        )).default
      );
    });

    it('should match pruned lock file', () => {
      const appPackageJson = require(joinPathFragments(
        __dirname,
        '__fixtures__/nextjs/app/package.json'
      ));
      const prunedGraph = pruneProjectGraph(graph, appPackageJson);
      const result = stringifyYarnLockfile(
        prunedGraph,
        lockFile,
        appPackageJson
      );
      expect(result).toEqual(
        require(joinPathFragments(
          __dirname,
          '__fixtures__/nextjs/app/yarn.lock'
        )).default
      );
    });
  });

  describe('auxiliary packages', () => {
    beforeEach(() => {
      const fileSys = {
        'node_modules/brace-expansion/package.json': '{"version": "1.1.11"}',
        'node_modules/eslint-visitor-keys/package.json': '{"version": "3.3.0"}',
        'node_modules/ignore/package.json': '{"version": "5.2.4"}',
        'node_modules/minimatch/package.json': '{"version": "3.1.2"}',
      };
      vol.fromJSON(fileSys, '/root');
    });

    it('should parse yarn classic', async () => {
      const classicLockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/auxiliary-packages/yarn.lock'
      )).default;
      const graph = parseYarnLockfile(classicLockFile);
      expect(Object.keys(graph.externalNodes).length).toEqual(127); // 124 hoisted

      expect(graph.externalNodes['npm:minimatch']).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "sha512-J7p63hRiAjw1NDEww1W7i37+ByIrOWO5XQQAzZ3VOcL0PNybwpfmV/N05zFAzwQ9USyEcX6t3UO+K5aqBQOIHw==",
            "packageName": "minimatch",
            "version": "3.1.2",
          },
          "name": "npm:minimatch",
          "type": "npm",
        }
      `);
      expect(graph.externalNodes['npm:minimatch@5.1.1']).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "sha512-362NP+zlprccbEt/SkxKfRMHnNY85V74mVnpUpNyr3F35covl09Kec7/sEFLt3RA4oXmewtoaanoIf67SE5Y5g==",
            "packageName": "minimatch",
            "version": "5.1.1",
          },
          "name": "npm:minimatch@5.1.1",
          "type": "npm",
        }
      `);
      expect(graph.externalNodes['npm:postgres']).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "89b0967274cbe05ffc81fee9ce2f0e58aac96f15cf97e916258044ed9a2e6f61",
            "packageName": "postgres",
            "version": "https://codeload.github.com/charsleysa/postgres/tar.gz/3b1a01b2da3e2fafb1a79006f838eff11a8de3cb",
          },
          "name": "npm:postgres",
          "type": "npm",
        }
      `);
      expect(graph.externalNodes['npm:eslint-plugin-disable-autofix'])
        .toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "sha512-zYDdpaj+1Al8Ki3WpY2I9bOAd8NSgFWGT7yR6KemSi25qWwDMNArnR2q6gDEDKSw+KuYY4shFxkY/JpoNF64tg==",
            "packageName": "eslint-plugin-disable-autofix",
            "version": "npm:@mattlewis92/eslint-plugin-disable-autofix@3.0.0",
          },
          "name": "npm:eslint-plugin-disable-autofix",
          "type": "npm",
        }
      `);
    });

    it('should prune yarn classic', () => {
      const lockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/auxiliary-packages/yarn.lock'
      )).default;
      const normalizedPackageJson = {
        name: 'test',
        version: '0.0.0',
        license: 'MIT',
        dependencies: {
          '@nrwl/devkit': '15.0.13',
          'eslint-plugin-disable-autofix':
            'npm:@mattlewis92/eslint-plugin-disable-autofix@3.0.0',
          postgres:
            'https://codeload.github.com/charsleysa/postgres/tar.gz/3b1a01b2da3e2fafb1a79006f838eff11a8de3cb',
          yargs: '17.6.2',
        },
        devDependencies: {
          react: '18.2.0',
        },
      };
      const prunedLockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/auxiliary-packages/yarn.lock.pruned'
      )).default;

      const graph = parseYarnLockfile(lockFile);
      const prunedGraph = pruneProjectGraph(graph, normalizedPackageJson);
      const result = stringifyYarnLockfile(
        prunedGraph,
        lockFile,
        normalizedPackageJson
      );
      expect(result).toEqual(prunedLockFile);
    });

    it('should prune yarn classic with package json with ranges', () => {
      const lockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/auxiliary-packages/yarn.lock'
      )).default;
      const normalizedPackageJson = {
        name: 'test',
        version: '0.0.0',
        license: 'MIT',
        dependencies: {
          '@nrwl/devkit': '^15.0.0',
          'eslint-plugin-disable-autofix':
            'npm:@mattlewis92/eslint-plugin-disable-autofix@3.0.0',
          postgres:
            'https://codeload.github.com/charsleysa/postgres/tar.gz/3b1a01b2da3e2fafb1a79006f838eff11a8de3cb',
          yargs: '~17.6.0',
        },
        devDependencies: {
          react: '>=18 < 19',
        },
      };
      const prunedLockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/auxiliary-packages/yarn.lock.pruned'
      )).default;

      const graph = parseYarnLockfile(lockFile);
      const prunedGraph = pruneProjectGraph(graph, normalizedPackageJson);
      const result = stringifyYarnLockfile(
        prunedGraph,
        lockFile,
        normalizedPackageJson
      );
      expect(result).toEqual(
        prunedLockFile
          .replace('"@nrwl/devkit@15.0.13":', '"@nrwl/devkit@^15.0.0":')
          .replace('react@18.2.0:', '"react@>=18 < 19":')
          .replace('yargs@17.6.2:', 'yargs@~17.6.0:')
      );
    });

    it('should parse yarn berry', async () => {
      const berryLockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/auxiliary-packages/yarn-berry.lock'
      )).default;
      const graph = parseYarnLockfile(berryLockFile);
      expect(Object.keys(graph.externalNodes).length).toEqual(128); //124 hoisted

      expect(graph.externalNodes['npm:minimatch']).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "c154e566406683e7bcb746e000b84d74465b3a832c45d59912b9b55cd50dee66e5c4b1e5566dba26154040e51672f9aa450a9aef0c97cfc7336b78b7afb9540a",
            "packageName": "minimatch",
            "version": "3.1.2",
          },
          "name": "npm:minimatch",
          "type": "npm",
        }
      `);
      expect(graph.externalNodes['npm:minimatch@5.1.1']).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "215edd0978320a3354188f84a537d45841f2449af4df4379f79b9b777e71aa4f5722cc9d1717eabd2a70d38ef76ab7b708d24d83ea6a6c909dfd8833de98b437",
            "packageName": "minimatch",
            "version": "5.1.1",
          },
          "name": "npm:minimatch@5.1.1",
          "type": "npm",
        }
      `);
      expect(graph.externalNodes['npm:postgres']).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "521660853e0c9f1c604cf43d32c75e2b4675e2d912eaec7bb6749716539dd53f1dfaf575a422087f6a53362f5162f9a4b8a88cc1dadf9d7580423fc05137767a",
            "packageName": "postgres",
            "version": "https://github.com/charsleysa/postgres.git#commit=3b1a01b2da3e2fafb1a79006f838eff11a8de3cb",
          },
          "name": "npm:postgres",
          "type": "npm",
        }
      `);
      expect(graph.externalNodes['npm:eslint-plugin-disable-autofix'])
        .toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "fb7272c37e5701df14a79d0f8a9d6a0cb521972011ba91d70290eefc33fca589307908a6fb63e2985257b1c7cc3839c076d1c8def0caabddf21a91f13d7c8fc1",
            "packageName": "eslint-plugin-disable-autofix",
            "version": "npm:@mattlewis92/eslint-plugin-disable-autofix@3.0.0",
          },
          "name": "npm:eslint-plugin-disable-autofix",
          "type": "npm",
        }
      `);
    });

    it('should prune yarn berry', () => {
      const lockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/auxiliary-packages/yarn-berry.lock'
      )).default;
      const normalizedPackageJson = {
        name: 'test',
        version: '0.0.0',
        license: 'MIT',
        dependencies: {
          '@nrwl/devkit': '15.0.13',
          'eslint-plugin-disable-autofix':
            'npm:@mattlewis92/eslint-plugin-disable-autofix@3.0.0',
          postgres:
            'https://github.com/charsleysa/postgres.git#commit=3b1a01b2da3e2fafb1a79006f838eff11a8de3cb',
          yargs: '17.6.2',
        },
        devDependencies: {
          react: '18.2.0',
        },
      };
      const prunedLockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/auxiliary-packages/yarn-berry.lock.pruned'
      )).default;

      const graph = parseYarnLockfile(lockFile);
      const prunedGraph = pruneProjectGraph(graph, normalizedPackageJson);
      const result = stringifyYarnLockfile(
        prunedGraph,
        lockFile,
        normalizedPackageJson
      );
      expect(result.split('\n').slice(2)).toEqual(
        prunedLockFile.split('\n').slice(2)
      );
    });
  });

  describe('duplicate packages', () => {
    beforeEach(() => {
      const fileSys = {
        'node_modules/@jest/test-result/package.json': '{"version": "28.1.3"}',
        'node_modules/@jridgewell/gen-mapping/package.json':
          '{"version": "0.1.1"}',
        'node_modules/@nrwl/cli/package.json': '{"version": "15.4.0"}',
        'node_modules/@nrwl/tao/package.json': '{"version": "15.4.0"}',
        'node_modules/ansi-styles/package.json': '{"version": "4.3.0"}',
        'node_modules/argparse/package.json': '{"version": "2.0.1"}',
        'node_modules/brace-expansion/package.json': '{"version": "1.1.11"}',
        'node_modules/camelcase/package.json': '{"version": "6.3.0"}',
        'node_modules/chalk/package.json': '{"version": "4.1.2"}',
        'node_modules/cliui/package.json': '{"version": "7.0.4"}',
        'node_modules/color-convert/package.json': '{"version": "2.0.1"}',
        'node_modules/color-name/package.json': '{"version": "1.1.4"}',
        'node_modules/escape-string-regexp/package.json':
          '{"version": "1.0.5"}',
        'node_modules/glob/package.json': '{"version": "7.2.3"}',
        'node_modules/has-flag/package.json': '{"version": "4.0.0"}',
        'node_modules/jest-resolve/package.json': '{"version": "28.1.3"}',
        'node_modules/jest-util/package.json': '{"version": "28.1.3"}',
        'node_modules/js-yaml/package.json': '{"version": "3.14.1"}',
        'node_modules/json5/package.json': '{"version": "1.0.2"}',
        'node_modules/lru-cache/package.json': '{"version": "6.0.0"}',
        'node_modules/minimatch/package.json': '{"version": "3.1.2"}',
        'node_modules/nx/package.json': '{"version": "15.4.0"}',
        'node_modules/p-limit/package.json': '{"version": "3.1.0"}',
        'node_modules/semver/package.json': '{"version": "6.3.0"}',
        'node_modules/strip-bom/package.json': '{"version": "3.0.0"}',
        'node_modules/supports-color/package.json': '{"version": "7.2.0"}',
        'node_modules/tslib/package.json': '{"version": "2.4.1"}',
        'node_modules/yallist/package.json': '{"version": "4.0.0"}',
        'node_modules/yargs-parser/package.json': '{"version": "21.0.1"}',
      };
      vol.fromJSON(fileSys, '/root');
    });

    it('should parse root lock file', async () => {
      const classicLockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/duplicate-package/yarn.lock'
      )).default;
      const graph = parseYarnLockfile(classicLockFile);
      expect(Object.keys(graph.externalNodes).length).toEqual(371); //337 hoisted
    });
  });

  describe('optional packages', () => {
    beforeEach(() => {
      const fileSys = {
        'node_modules/brace-expansion/package.json': '{"version": "1.1.11"}',
        'node_modules/glob/package.json': '{"version": "7.2.3"}',
        'node_modules/lru-cache/package.json': '{"version": "7.14.1"}',
        'node_modules/minimatch/package.json': '{"version": "3.1.2"}',
        'node_modules/minipass/package.json': '{"version": "3.3.6"}',
        'node_modules/ms/package.json': '{"version": "2.1.3"}',
        'node_modules/ssh2/package.json': '{"version": "1.11.0"}',
      };
      vol.fromJSON(fileSys, '/root');
    });

    it('should match parsed and pruned graph', async () => {
      const lockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/optional/yarn.lock'
      )).default;
      const packageJson = require(joinPathFragments(
        __dirname,
        '__fixtures__/optional/package.json'
      ));
      const graph = parseYarnLockfile(lockFile);
      expect(Object.keys(graph.externalNodes).length).toEqual(103);

      const prunedGraph = pruneProjectGraph(graph, packageJson);
      expect(graph).toEqual(prunedGraph);
    });
  });

  describe('pruning', () => {
    beforeEach(() => {
      const fileSys = {
        'node_modules/@jest/test-result/package.json': '{"version": "28.1.3"}',
        'node_modules/@jridgewell/gen-mapping/package.json':
          '{"version": "0.1.1"}',
        'node_modules/ansi-styles/package.json': '{"version": "4.3.0"}',
        'node_modules/argparse/package.json': '{"version": "2.0.1"}',
        'node_modules/brace-expansion/package.json': '{"version": "1.1.11"}',
        'node_modules/camelcase/package.json': '{"version": "6.3.0"}',
        'node_modules/chalk/package.json': '{"version": "4.1.0"}',
        'node_modules/cliui/package.json': '{"version": "7.0.4"}',
        'node_modules/color-convert/package.json': '{"version": "2.0.1"}',
        'node_modules/color-name/package.json': '{"version": "1.1.4"}',
        'node_modules/escape-string-regexp/package.json':
          '{"version": "1.0.5"}',
        'node_modules/glob/package.json': '{"version": "7.1.4"}',
        'node_modules/has-flag/package.json': '{"version": "4.0.0"}',
        'node_modules/jest-resolve/package.json': '{"version": "28.1.3"}',
        'node_modules/jest-util/package.json': '{"version": "28.1.3"}',
        'node_modules/js-yaml/package.json': '{"version": "4.1.0"}',
        'node_modules/json5/package.json': '{"version": "2.2.3"}',
        'node_modules/lru-cache/package.json': '{"version": "6.0.0"}',
        'node_modules/minimatch/package.json': '{"version": "3.0.5"}',
        'node_modules/p-limit/package.json': '{"version": "3.1.0"}',
        'node_modules/semver/package.json': '{"version": "7.3.4"}',
        'node_modules/strip-bom/package.json': '{"version": "3.0.0"}',
        'node_modules/supports-color/package.json': '{"version": "7.2.0"}',
        'node_modules/tslib/package.json': '{"version": "2.4.1"}',
        'node_modules/yallist/package.json': '{"version": "4.0.0"}',

        'node_modules/@nodelib/fs.scandir/package.json': '{"version": "2.1.5"}',
        'node_modules/@nodelib/fs.stat/package.json': '{"version": "2.0.5"}',
        'node_modules/@nodelib/fs.walk/package.json': '{"version": "1.2.8"}',
        'node_modules/@nrwl/cli/package.json': '{"version": "15.4.5"}',
        'node_modules/@nrwl/devkit/package.json': '{"version": "15.4.5"}',
        'node_modules/@nrwl/linter/package.json': '{"version": "15.4.5"}',
        'node_modules/@nrwl/tao/package.json': '{"version": "15.4.5"}',
        'node_modules/@nrwl/workspace/package.json': '{"version": "15.4.5"}',
        'node_modules/@parcel/watcher/package.json': '{"version": "2.0.4"}',
        'node_modules/@phenomnomnominal/tsquery/package.json':
          '{"version": "4.1.1"}',
        'node_modules/@yarnpkg/lockfile/package.json': '{"version": "1.1.0"}',
        'node_modules/@yarnpkg/parsers/package.json':
          '{"version": "3.0.0-rc.35"}',
        'node_modules/@zkochan/js-yaml/package.json': '{"version": "0.0.6"}',
        'node_modules/ansi-colors/package.json': '{"version": "4.1.3"}',
        'node_modules/ansi-regex/package.json': '{"version": "5.0.1"}',
        'node_modules/anymatch/package.json': '{"version": "3.1.3"}',
        'node_modules/async/package.json': '{"version": "3.2.4"}',
        'node_modules/asynckit/package.json': '{"version": "0.4.0"}',
        'node_modules/axios/package.json': '{"version": "1.2.2"}',
        'node_modules/balanced-match/package.json': '{"version": "1.0.2"}',
        'node_modules/base64-js/package.json': '{"version": "1.5.1"}',
        'node_modules/binary-extensions/package.json': '{"version": "2.2.0"}',
        'node_modules/bl/package.json': '{"version": "4.1.0"}',
        'node_modules/braces/package.json': '{"version": "3.0.2"}',
        'node_modules/buffer/package.json': '{"version": "5.7.1"}',
        'node_modules/chokidar/package.json': '{"version": "3.5.3"}',
        'node_modules/cli-cursor/package.json': '{"version": "3.1.0"}',
        'node_modules/cli-spinners/package.json': '{"version": "2.6.1"}',
        'node_modules/combined-stream/package.json': '{"version": "1.0.8"}',
        'node_modules/concat-map/package.json': '{"version": "0.0.1"}',
        'node_modules/define-lazy-prop/package.json': '{"version": "2.0.0"}',
        'node_modules/delayed-stream/package.json': '{"version": "1.0.0"}',
        'node_modules/dotenv/package.json': '{"version": "10.0.0"}',
        'node_modules/duplexer/package.json': '{"version": "0.1.2"}',
        'node_modules/ejs/package.json': '{"version": "3.1.8"}',
        'node_modules/emoji-regex/package.json': '{"version": "8.0.0"}',
        'node_modules/end-of-stream/package.json': '{"version": "1.4.4"}',
        'node_modules/enquirer/package.json': '{"version": "2.3.6"}',
        'node_modules/escalade/package.json': '{"version": "3.1.1"}',
        'node_modules/esprima/package.json': '{"version": "4.0.1"}',
        'node_modules/esquery/package.json': '{"version": "1.4.0"}',
        'node_modules/estraverse/package.json': '{"version": "5.3.0"}',
        'node_modules/fast-glob/package.json': '{"version": "3.2.7"}',
        'node_modules/fastq/package.json': '{"version": "1.15.0"}',
        'node_modules/figures/package.json': '{"version": "3.2.0"}',
        'node_modules/filelist/package.json': '{"version": "1.0.4"}',
        'node_modules/fill-range/package.json': '{"version": "7.0.1"}',
        'node_modules/flat/package.json': '{"version": "5.0.2"}',
        'node_modules/follow-redirects/package.json': '{"version": "1.15.2"}',
        'node_modules/form-data/package.json': '{"version": "4.0.0"}',
        'node_modules/fs-constants/package.json': '{"version": "1.0.0"}',
        'node_modules/fs-extra/package.json': '{"version": "10.1.0"}',
        'node_modules/fs.realpath/package.json': '{"version": "1.0.0"}',
        'node_modules/fsevents/package.json': '{"version": "2.3.2"}',
        'node_modules/get-caller-file/package.json': '{"version": "2.0.5"}',
        'node_modules/glob-parent/package.json': '{"version": "5.1.2"}',
        'node_modules/graceful-fs/package.json': '{"version": "4.2.10"}',
        'node_modules/ieee754/package.json': '{"version": "1.2.1"}',
        'node_modules/ignore/package.json': '{"version": "5.2.4"}',
        'node_modules/inflight/package.json': '{"version": "1.0.6"}',
        'node_modules/inherits/package.json': '{"version": "2.0.4"}',
        'node_modules/is-binary-path/package.json': '{"version": "2.1.0"}',
        'node_modules/is-docker/package.json': '{"version": "2.2.1"}',
        'node_modules/is-extglob/package.json': '{"version": "2.1.1"}',
        'node_modules/is-fullwidth-code-point/package.json':
          '{"version": "3.0.0"}',
        'node_modules/is-glob/package.json': '{"version": "4.0.3"}',
        'node_modules/is-number/package.json': '{"version": "7.0.0"}',
        'node_modules/is-wsl/package.json': '{"version": "2.2.0"}',
        'node_modules/jake/package.json': '{"version": "10.8.5"}',
        'node_modules/jsonc-parser/package.json': '{"version": "3.2.0"}',
        'node_modules/jsonfile/package.json': '{"version": "6.1.0"}',
        'node_modules/merge2/package.json': '{"version": "1.4.1"}',
        'node_modules/micromatch/package.json': '{"version": "4.0.5"}',
        'node_modules/mime-db/package.json': '{"version": "1.52.0"}',
        'node_modules/mime-types/package.json': '{"version": "2.1.35"}',
        'node_modules/mimic-fn/package.json': '{"version": "2.1.0"}',
        'node_modules/minimist/package.json': '{"version": "1.2.7"}',
        'node_modules/node-addon-api/package.json': '{"version": "3.2.1"}',
        'node_modules/node-gyp-build/package.json': '{"version": "4.6.0"}',
        'node_modules/normalize-path/package.json': '{"version": "3.0.0"}',
        'node_modules/npm-run-path/package.json': '{"version": "4.0.1"}',
        'node_modules/nx/package.json': '{"version": "15.4.5"}',
        'node_modules/once/package.json': '{"version": "1.4.0"}',
        'node_modules/onetime/package.json': '{"version": "5.1.2"}',
        'node_modules/open/package.json': '{"version": "8.4.0"}',
        'node_modules/path-is-absolute/package.json': '{"version": "1.0.1"}',
        'node_modules/path-key/package.json': '{"version": "3.1.1"}',
        'node_modules/picomatch/package.json': '{"version": "2.3.1"}',
        'node_modules/prettier/package.json': '{"version": "2.8.2"}',
        'node_modules/proxy-from-env/package.json': '{"version": "1.1.0"}',
        'node_modules/queue-microtask/package.json': '{"version": "1.2.3"}',
        'node_modules/readable-stream/package.json': '{"version": "3.6.0"}',
        'node_modules/readdirp/package.json': '{"version": "3.6.0"}',
        'node_modules/require-directory/package.json': '{"version": "2.1.1"}',
        'node_modules/restore-cursor/package.json': '{"version": "3.1.0"}',
        'node_modules/reusify/package.json': '{"version": "1.0.4"}',
        'node_modules/rimraf/package.json': '{"version": "3.0.2"}',
        'node_modules/run-parallel/package.json': '{"version": "1.2.0"}',
        'node_modules/rxjs/package.json': '{"version": "6.6.7"}',
        'node_modules/safe-buffer/package.json': '{"version": "5.2.1"}',
        'node_modules/signal-exit/package.json': '{"version": "3.0.7"}',
        'node_modules/sprintf-js/package.json': '{"version": "1.0.3"}',
        'node_modules/string-width/package.json': '{"version": "4.2.3"}',
        'node_modules/string_decoder/package.json': '{"version": "1.3.0"}',
        'node_modules/strip-ansi/package.json': '{"version": "6.0.1"}',
        'node_modules/strong-log-transformer/package.json':
          '{"version": "2.1.0"}',
        'node_modules/tar-stream/package.json': '{"version": "2.2.0"}',
        'node_modules/through/package.json': '{"version": "2.3.8"}',
        'node_modules/tmp/package.json': '{"version": "0.2.1"}',
        'node_modules/to-regex-range/package.json': '{"version": "5.0.1"}',
        'node_modules/tsconfig-paths/package.json': '{"version": "4.1.2"}',
        'node_modules/typescript/package.json': '{"version": "4.8.4"}',
        'node_modules/universalify/package.json': '{"version": "2.0.0"}',
        'node_modules/util-deprecate/package.json': '{"version": "1.0.2"}',
        'node_modules/v8-compile-cache/package.json': '{"version": "2.3.0"}',
        'node_modules/wrap-ansi/package.json': '{"version": "7.0.0"}',
        'node_modules/wrappy/package.json': '{"version": "1.0.2"}',
        'node_modules/y18n/package.json': '{"version": "5.0.8"}',
        'node_modules/yargs/package.json': '{"version": "17.6.2"}',
        'node_modules/yargs-parser/package.json': '{"version": "21.1.1"}',
      };
      vol.fromJSON(fileSys, '/root');
    });

    it('should prune single package', () => {
      const lockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/pruning/yarn.lock'
      )).default;

      const typescriptPackageJson = require(joinPathFragments(
        __dirname,
        '__fixtures__/pruning/typescript/package.json'
      ));
      const graph = parseYarnLockfile(lockFile);
      const prunedGraph = pruneProjectGraph(graph, typescriptPackageJson);
      const result = stringifyYarnLockfile(
        prunedGraph,
        lockFile,
        typescriptPackageJson
      );
      expect(result).toEqual(
        require(joinPathFragments(
          __dirname,
          '__fixtures__/pruning/typescript/yarn.lock'
        )).default
      );
    });

    it('should prune multi packages', () => {
      const lockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/pruning/yarn.lock'
      )).default;

      const multiPackageJson = require(joinPathFragments(
        __dirname,
        '__fixtures__/pruning/devkit-yargs/package.json'
      ));
      const graph = parseYarnLockfile(lockFile);
      const prunedGraph = pruneProjectGraph(graph, multiPackageJson);
      const result = stringifyYarnLockfile(
        prunedGraph,
        lockFile,
        multiPackageJson
      );
      expect(result).toEqual(
        require(joinPathFragments(
          __dirname,
          '__fixtures__/pruning/devkit-yargs/yarn.lock'
        )).default
      );
    });
  });

  describe('workspaces', () => {
    beforeEach(() => {
      const fileSys = {
        'packages/package-a/package.json':
          '{"name": "package-a", "version": "0.0.1", "dependencies": { "react": "18" } }',
        'node_modules/react/package.json': '{"version": "17.0.2"}',
      };
      vol.fromJSON(fileSys, '/root');
    });

    it('should parse classic lock file', async () => {
      const lockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/workspaces/yarn.lock'
      )).default;
      const graph = parseYarnLockfile(lockFile);
      expect(Object.keys(graph.externalNodes).length).toEqual(5);
    });

    it('should parse berry lock file', async () => {
      const lockFile = require(joinPathFragments(
        __dirname,
        '__fixtures__/workspaces/yarn.lock.berry'
      )).default;
      const graph = parseYarnLockfile(lockFile);
      expect(Object.keys(graph.externalNodes).length).toEqual(5);
    });
  });

  describe('different registry', () => {
    const prunedPackageJson: PackageJson = {
      name: '@my-ns/example',
      version: '0.0.1',
      type: 'commonjs',
      dependencies: {
        '@gitlab-examples/semantic-release-npm': '2.0.1',
      },
      peerDependencies: {
        tslib: '2.5.0',
      },
      main: './src/index.js',
      types: './src/index.d.ts',
    };

    it('should parse and prune classic', () => {
      const lockFile = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


"@gitlab-examples/semantic-release-npm@^2.0.1":
  version "2.0.1"
  resolved "https://gitlab.com/api/v4/projects/22738259/packages/npm/@gitlab-examples/semantic-release-npm/-/@gitlab-examples/semantic-release-npm-2.0.1.tgz#923345c3fdc51c6cdf921e7c0e9b43e999caa61a"
  integrity sha1-kjNFw/3FHGzfkh58DptD6ZnKpho=

tslib@^2.3.0, tslib@^2.4.0:
  version "2.5.0"
  resolved "https://registry.yarnpkg.com/tslib/-/tslib-2.5.0.tgz#42bfed86f5787aeb41d031866c8f402429e0fddf"
  integrity sha512-336iVw3rtn2BUK7ORdIAHTyxHGRIHVReokCR3XjbckJMK7ms8FysBfhLR8IXnAgy7T0PTPNBWKiH514FOW/WSg==

type-fest@^0.20.2:
  version "0.20.2"
  resolved "https://registry.yarnpkg.com/type-fest/-/type-fest-0.20.2.tgz#1bf207f4b28f91583666cb5fbd327887301cd5f4"
  integrity sha512-Ne+eE4r0/iWnpAxD852z3A+N0Bt5RN//NjJwRd2VFHEmrywxf5vsZlh4R6lixl6B+wz/8d+maTSAkN1FIkI3LQ==
`;

      const graph = parseYarnLockfile(lockFile);
      expect(graph.externalNodes['npm:tslib']).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "sha512-336iVw3rtn2BUK7ORdIAHTyxHGRIHVReokCR3XjbckJMK7ms8FysBfhLR8IXnAgy7T0PTPNBWKiH514FOW/WSg==",
            "packageName": "tslib",
            "version": "2.5.0",
          },
          "name": "npm:tslib",
          "type": "npm",
        }
      `);
      expect(graph.externalNodes['npm:@gitlab-examples/semantic-release-npm'])
        .toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "sha1-kjNFw/3FHGzfkh58DptD6ZnKpho=",
            "packageName": "@gitlab-examples/semantic-release-npm",
            "version": "2.0.1",
          },
          "name": "npm:@gitlab-examples/semantic-release-npm",
          "type": "npm",
        }
      `);
      const prunedGraph = pruneProjectGraph(graph, prunedPackageJson);
      expect(stringifyYarnLockfile(prunedGraph, lockFile, prunedPackageJson))
        .toMatchInlineSnapshot(`
        "# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
        # yarn lockfile v1


        \\"@gitlab-examples/semantic-release-npm@2.0.1\\":
          version \\"2.0.1\\"
          resolved \\"https://gitlab.com/api/v4/projects/22738259/packages/npm/@gitlab-examples/semantic-release-npm/-/@gitlab-examples/semantic-release-npm-2.0.1.tgz#923345c3fdc51c6cdf921e7c0e9b43e999caa61a\\"
          integrity sha1-kjNFw/3FHGzfkh58DptD6ZnKpho=

        tslib@2.5.0:
          version \\"2.5.0\\"
          resolved \\"https://registry.yarnpkg.com/tslib/-/tslib-2.5.0.tgz#42bfed86f5787aeb41d031866c8f402429e0fddf\\"
          integrity sha512-336iVw3rtn2BUK7ORdIAHTyxHGRIHVReokCR3XjbckJMK7ms8FysBfhLR8IXnAgy7T0PTPNBWKiH514FOW/WSg==
        "
      `);
    });

    it('should parse and prune berry', () => {
      const lockFile = `# This file is generated by running "yarn install" inside your project.
# Manual changes might be lost - proceed with caution!

__metadata:
  version: 6
  cacheKey: 8

"@gar/promisify@npm:^1.1.3":
  version: 1.1.3
  resolution: "@gar/promisify@npm:1.1.3"
  checksum: 4059f790e2d07bf3c3ff3e0fec0daa8144fe35c1f6e0111c9921bd32106adaa97a4ab096ad7dab1e28ee6a9060083c4d1a4ada42a7f5f3f7a96b8812e2b757c1
  languageName: node
  linkType: hard

"@gitlab-examples/semantic-release-npm@npm:^2.0.1":
  version: 2.0.1
  resolution: "@gitlab-examples/semantic-release-npm@npm:2.0.1::__archiveUrl=https%3A%2F%2Fgitlab.com%2Fapi%2Fv4%2Fprojects%2F22738259%2Fpackages%2Fnpm%2F%40gitlab-examples%2Fsemantic-release-npm%2F-%2F%40gitlab-examples%2Fsemantic-release-npm-2.0.1.tgz"
  checksum: 1944ac24ebb3e7c30db4fe743b75f0bb3b82a0c142c9ba435aa8224005fcc2bc709e21cec109c6f67d6290e0abb6032a55eaca38ca950711bf03317d128db30a
  languageName: node
  linkType: hard

"tslib@npm:^2.3.0, tslib@npm:^2.4.0":
  version: 2.5.0
  resolution: "tslib@npm:2.5.0"
  checksum: ae3ed5f9ce29932d049908ebfdf21b3a003a85653a9a140d614da6b767a93ef94f460e52c3d787f0e4f383546981713f165037dc2274df212ea9f8a4541004e1
  languageName: node
  linkType: hard
`;
      const graph = parseYarnLockfile(lockFile);
      expect(graph.externalNodes['npm:tslib']).toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "ae3ed5f9ce29932d049908ebfdf21b3a003a85653a9a140d614da6b767a93ef94f460e52c3d787f0e4f383546981713f165037dc2274df212ea9f8a4541004e1",
            "packageName": "tslib",
            "version": "2.5.0",
          },
          "name": "npm:tslib",
          "type": "npm",
        }
      `);
      expect(graph.externalNodes['npm:@gitlab-examples/semantic-release-npm'])
        .toMatchInlineSnapshot(`
        Object {
          "data": Object {
            "hash": "1944ac24ebb3e7c30db4fe743b75f0bb3b82a0c142c9ba435aa8224005fcc2bc709e21cec109c6f67d6290e0abb6032a55eaca38ca950711bf03317d128db30a",
            "packageName": "@gitlab-examples/semantic-release-npm",
            "version": "2.0.1",
          },
          "name": "npm:@gitlab-examples/semantic-release-npm",
          "type": "npm",
        }
      `);

      const prunedGraph = pruneProjectGraph(graph, prunedPackageJson);
      expect(stringifyYarnLockfile(prunedGraph, lockFile, prunedPackageJson))
        .toMatchInlineSnapshot(`
        "# This file was generated by Nx. Do not edit this file directly
        # Manual changes might be lost - proceed with caution!

        __metadata:
          version: 6
          cacheKey: 8

        \\"@gitlab-examples/semantic-release-npm@npm:2.0.1\\":
          version: 2.0.1
          resolution: \\"@gitlab-examples/semantic-release-npm@npm:2.0.1::__archiveUrl=https%3A%2F%2Fgitlab.com%2Fapi%2Fv4%2Fprojects%2F22738259%2Fpackages%2Fnpm%2F%40gitlab-examples%2Fsemantic-release-npm%2F-%2F%40gitlab-examples%2Fsemantic-release-npm-2.0.1.tgz\\"
          checksum: 1944ac24ebb3e7c30db4fe743b75f0bb3b82a0c142c9ba435aa8224005fcc2bc709e21cec109c6f67d6290e0abb6032a55eaca38ca950711bf03317d128db30a
          languageName: node
          linkType: hard

        \\"@my-ns/example@workspace:.\\":
          version: 0.0.0-use.local
          resolution: \\"@my-ns/example@workspace:.\\"
          dependencies:
            \\"@gitlab-examples/semantic-release-npm\\": 2.0.1
          peerDependencies:
            tslib: 2.5.0
          languageName: unknown
          linkType: soft

        \\"tslib@npm:2.5.0\\":
          version: 2.5.0
          resolution: \\"tslib@npm:2.5.0\\"
          checksum: ae3ed5f9ce29932d049908ebfdf21b3a003a85653a9a140d614da6b767a93ef94f460e52c3d787f0e4f383546981713f165037dc2274df212ea9f8a4541004e1
          languageName: node
          linkType: hard
        "
      `);
    });
  });
});
