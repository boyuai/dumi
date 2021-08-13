import React from 'react';
import type { IRouteComponentProps } from '@umijs/types';
import type { IThemeContext } from './context';
export interface IOuterLayoutProps {
    mode: IThemeContext['config']['mode'];
    title: IThemeContext['config']['title'];
    logo: IThemeContext['config']['logo'];
    description: IThemeContext['config']['description'];
    repository: IThemeContext['config']['repository'];
    navs: IThemeContext['config']['navs'];
    menus: IThemeContext['config']['menus'];
    locales: IThemeContext['config']['locales'];
    algolia: IThemeContext['config']['algolia'];
    routes: IThemeContext['routes'];
}
/**
 * outer theme layout
 */
declare const OuterLayout: React.FC<IOuterLayoutProps & IRouteComponentProps>;
export default OuterLayout;
