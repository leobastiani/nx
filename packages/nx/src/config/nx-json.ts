import { PackageManager } from '../utils/package-manager';
import {
  InputDefinition,
  TargetConfiguration,
  TargetDependencyConfig,
} from './workspace-json-project-json';

export type ImplicitDependencyEntry<T = '*' | string[]> = {
  [key: string]: T | ImplicitJsonSubsetDependency<T>;
};

export interface ImplicitJsonSubsetDependency<T = '*' | string[]> {
  [key: string]: T | ImplicitJsonSubsetDependency<T>;
}

export interface NxAffectedConfig {
  /**
   * Default based branch used by affected commands.
   */
  defaultBase?: string;
}

export type TargetDefaults = Record<string, Partial<TargetConfiguration>>;

export type TargetDependencies = Record<
  string,
  (TargetDependencyConfig | string)[]
>;

export interface NrwlJsPluginConfig {
  analyzeSourceFiles?: boolean;
  analyzePackageJson?: boolean;
}

interface NxInstallationConfiguration {
  /**
   * Version used for Nx
   */
  version: string;
  /**
   * Record<pluginPackageName, pluginVersion>. e.g.
   * plugins: { '@nrwl/angular': '1.0.0' }
   */
  plugins?: Record<string, string>;
}

/**
 * Nx.json configuration
 *
 * @note: when adding properties here add them to `allowedWorkspaceExtensions` in adapter/compat.ts
 */
export interface NxJsonConfiguration<T = '*' | string[]> {
  /**
   * Optional (additional) Nx.json configuration file which becomes a base for this one
   */
  extends?: string;
  /**
   * Map of files to projects that implicitly depend on them
   */
  implicitDependencies?: ImplicitDependencyEntry<T>;
  /**
   * @deprecated use targetDefaults instead
   * Dependencies between different target names across all projects
   */
  targetDependencies?: TargetDependencies;
  /**
   * Named inputs targets can refer to reduce duplication
   */
  namedInputs?: { [inputName: string]: (string | InputDefinition)[] };
  /**
   * Dependencies between different target names across all projects
   */
  targetDefaults?: TargetDefaults;
  /**
   * NPM Scope that the workspace uses
   */
  npmScope?: string;
  /**
   * Default options for `nx affected`
   */
  affected?: NxAffectedConfig;
  /**
   * Where new apps + libs should be placed
   */
  workspaceLayout?: {
    libsDir: string;
    appsDir: string;
  };
  /**
   * Available Task Runners
   */
  tasksRunnerOptions?: {
    [tasksRunnerName: string]: {
      /**
       * Path to resolve the runner
       */
      runner: string;
      /**
       * Default options for the runner
       */
      options?: any;
    };
  };
  /**
   * List of default values used by generators.
   *
   * These defaults are global. They are used when no other defaults are configured.
   *
   * Example:
   *
   * ```
   * {
   *   "@nrwl/react": {
   *     "library": {
   *       "style": "scss"
   *     }
   *   }
   * }
   * ```
   */
  generators?: { [collectionName: string]: { [generatorName: string]: any } };

  /**
   * Default generator collection. It is used when no collection is provided.
   */
  cli?: {
    packageManager?: PackageManager;

    /**
     * @deprecated - defaultCollection is deprecated and will be removed
     */
    defaultCollection?: string;
    defaultProjectName?: string;
  };
  /**
   * Plugins for extending the project graph
   */
  plugins?: string[];

  /**
   * Configuration for Nx Plugins
   */
  pluginsConfig?: Record<string, unknown>;

  /**
   * Default project. When project isn't provided, the default project
   * will be used. Convenient for small workspaces with one main application.
   */
  defaultProject?: string;

  /**
   * Configures the Nx installation for a repo. Useful for maintaining  a separate
   * set of dependencies for Nx + Plugins compared to the base package.json, but also
   * useful for workspaces that don't have a root package.json + node_modules.
   */
  installation?: NxInstallationConfiguration;
}
