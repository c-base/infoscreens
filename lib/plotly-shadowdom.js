// Hack for Shadow DOM compat
export default function injectCss(root) {
  const styles = document.createElement('style');
  styles.appendChild(document.createTextNode(`
    .js-plotly-plot .plotly .main-svg {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }`));
  root.appendChild(styles);
};
