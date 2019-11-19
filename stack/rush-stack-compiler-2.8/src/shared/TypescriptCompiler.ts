// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import * as path from 'path';
import { ITerminalProvider } from '@microsoft/node-core-library';

import { CmdRunner } from './CmdRunner';
import { ToolPaths } from './ToolPaths';
import { RushStackCompilerBase } from './RushStackCompilerBase';

/**
 * @beta
 */
export interface ITypescriptCompilerOptions {
  /**
   * Option to pass custom arguments to the tsc command.
   */
  customArgs?: string[];
}

/**
 * @beta
 */
export class TypescriptCompiler extends RushStackCompilerBase<ITypescriptCompilerOptions> {
  private _cmdRunner: CmdRunner;

  constructor(rootPath: string, terminalProvider: ITerminalProvider);
  constructor(taskOptions: ITypescriptCompilerOptions, rootPath: string, terminalProvider: ITerminalProvider);
  constructor(arg1: ITypescriptCompilerOptions | string, arg2: string | ITerminalProvider, arg3?: ITerminalProvider) {
    super(
      typeof arg1 === 'string' ? {} : arg1,
      typeof arg2 === 'string' ? arg2 : arg1 as string,
      arg3 ? arg3 : arg2 as ITerminalProvider
    );
    this._cmdRunner = new CmdRunner(
      this._standardBuildFolders,
      this._terminal,
      {
        packagePath: ToolPaths.typescriptPackagePath,
        packageJson: ToolPaths.typescriptPackageJson,
        packageBinPath: path.join('bin', 'tsc')
      }
    );
  }

  public invoke(): Promise<void> {
    return this._cmdRunner.runCmd({
      args: this._taskOptions.customArgs || [],
      onData: (data: Buffer) => {
        // Log lines separately
        const dataLines: (string | undefined)[] = data.toString().split('\n');
        for (const dataLine of dataLines) {
          const trimmedLine: string = (dataLine || '').trim();
          if (!!trimmedLine) {
            if (trimmedLine.match(/\serror\s/i)) {
              // If the line looks like an error, log it as an error
              this._terminal.writeErrorLine(trimmedLine);
            } else {
              this._terminal.writeLine(trimmedLine);
            }
          }
        }
      }
    });
  }
}
