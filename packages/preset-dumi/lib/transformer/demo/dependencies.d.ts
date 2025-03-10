import type { IWatcherItem } from '../../utils/watcher';
import type { IDemoOpts } from './options';
export interface IDepAnalyzeResult {
    dependencies: Record<string, {
        version: string;
        css?: string;
    }>;
    files: Record<string, {
        import: string;
        fileAbsPath: string;
    }>;
}
export declare const LOCAL_DEP_EXT: string[];
export declare const LOCAL_MODULE_EXT: string[];
export declare const PLAIN_TEXT_EXT: string[];
declare function analyzeDeps(raw: string, { isTSX, fileAbsPath, entryAbsPath, depChangeListener, files, }: IDemoOpts & {
    entryAbsPath?: string;
    depChangeListener?: IWatcherItem['listeners'][0];
    files?: IDepAnalyzeResult['files'];
}): IDepAnalyzeResult;
export declare function getCSSForDep(dep: string): string;
export default analyzeDeps;
