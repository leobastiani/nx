import type { Tree } from '@nrwl/devkit';
import { formatFiles, stripIndents } from '@nrwl/devkit';
import { lt } from 'semver';
import { checkPathUnderProjectRoot } from '../utils/path';
import { getInstalledAngularVersionInfo } from '../utils/version-utils';
import { exportComponentInEntryPoint } from './lib/component';
import { normalizeOptions } from './lib/normalize-options';
import type { Schema } from './schema';

export async function componentGenerator(tree: Tree, rawOptions: Schema) {
  const installedAngularVersionInfo = getInstalledAngularVersionInfo(tree);

  if (
    lt(installedAngularVersionInfo.version, '14.1.0') &&
    rawOptions.standalone
  ) {
    throw new Error(stripIndents`The "standalone" option is only supported in Angular >= 14.1.0. You are currently using ${installedAngularVersionInfo.version}.
    You can resolve this error by removing the "standalone" option or by migrating to Angular 14.1.0.`);
  }

  const options = await normalizeOptions(tree, rawOptions);
  const { projectSourceRoot, ...schematicOptions } = options;

  checkPathUnderProjectRoot(tree, options.project, options.path);

  const { wrapAngularDevkitSchematic } = require('@nrwl/devkit/ngcli-adapter');
  const angularComponentSchematic = wrapAngularDevkitSchematic(
    '@schematics/angular',
    'component'
  );
  await angularComponentSchematic(tree, schematicOptions);

  exportComponentInEntryPoint(tree, options);

  await formatFiles(tree);
}

export default componentGenerator;
