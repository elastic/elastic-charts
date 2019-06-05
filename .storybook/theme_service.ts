/* tslint:disable */
// @ts-ignore
import resetDark from '!!style-loader/useable?{attrs:{"nonce":"Pk1rZ1XDlMuYe8ubWV3Lh0BzwrTigJQ="}}!css-loader!sass-loader!../src/reset_dark.scss';
// @ts-ignore
import resetLight from '!!style-loader/useable?{attrs:{"nonce":"Pk1rZ1XDlMuYe8ubWV3Lh0BzwrTigJQ="}}!css-loader!sass-loader!../src/reset_light.scss';
// @ts-ignore
import themeDark from '!!style-loader/useable?{attrs:{"nonce":"Pk1rZ1XDlMuYe8ubWV3Lh0BzwrTigJQ="}}!css-loader!sass-loader!../src/theme_dark.scss';
// @ts-ignore
import themeLight from '!!style-loader/useable?{attrs:{"nonce":"Pk1rZ1XDlMuYe8ubWV3Lh0BzwrTigJQ="}}!css-loader!sass-loader!../src/theme_light.scss';

export function switchTheme(theme: string) {
  switch (theme) {
    case 'light':
      resetDark.unuse();
      resetLight.use();
      themeDark.unuse();
      themeLight.use();
      return;
    case 'dark':
      resetLight.unuse();
      resetDark.use();
      themeLight.unuse();
      themeDark.use();
      return;
  }
}
