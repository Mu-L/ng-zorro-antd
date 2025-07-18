/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { getProjectFromWorkspace, getProjectMainFile, isStandaloneApp } from '@angular/cdk/schematics';

import {
  apply,
  applyTemplates,
  chain,
  FileEntry,
  forEach,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  strings,
  Tree,
  url
} from '@angular-devkit/schematics';
import { Style } from '@schematics/angular/application/schema';
import { readWorkspace } from '@schematics/angular/utility';

import { Schema } from './schema';
import { addModule } from '../../utils/root-module';

export default function(options: Schema): Rule {
  return async (host: Tree) => {
    const workspace = await readWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const mainFile = getProjectMainFile(project);
    const prefix = options.prefix || project.prefix;
    const style = options.style || Style.Css;

    if (isStandaloneApp(host, mainFile)) {
      return chain([
        mergeWith(
          apply(
            url('./standalone/src'), [
              applyTemplates({
                prefix,
                style,
                ...strings,
                ...options
              }),
              move(project.sourceRoot),
              forEach((fileEntry: FileEntry) => {
                if (host.exists(fileEntry.path)) {
                  host.overwrite(fileEntry.path, fileEntry.content);
                }
                return fileEntry;
              })
            ]
          ),
          MergeStrategy.Overwrite
        )
      ]);
    } else {
      return chain([
        mergeWith(
          apply(
            url('./files/src'), [
              applyTemplates({
                prefix,
                style,
                ...strings,
                ...options
              }),
              move(project.sourceRoot),
              forEach((fileEntry: FileEntry) => {
                if (host.exists(fileEntry.path)) {
                  host.overwrite(fileEntry.path, fileEntry.content);
                }
                return fileEntry;
              })
            ]
          ),
          MergeStrategy.Overwrite
        ),
        addModule('AppRoutingModule', './app-routing.module', options.project)
      ]);
    }
  }
}
