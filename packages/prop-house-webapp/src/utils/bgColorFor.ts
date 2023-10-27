export enum BgColorElement {
  App,
  Nav,
  Footer,
  CreateProp,
}
const bgColorFor = (element: BgColorElement, path: string) => {
  const gray = 'bgGray';
  const white = 'bgWhite';

  const app = element === BgColorElement.App;
  const nav = element === BgColorElement.Nav;
  const footer = element === BgColorElement.Footer;

  const isHomePath = path === '/';
  const isRoundOrHousePath =
    /^\/0x[0-9a-fA-F]{40}(\/\d+)?$/.test(path) && path.split('/').length === 2;
  const isPropPath = /^\/0x[0-9a-fA-F]{40}\/\d+$/.test(path);
  const isCreatePropPath = path === '/create-prop';

  if (isHomePath || isCreatePropPath) return gray;

  if (isRoundOrHousePath) {
    if (app || nav) return white;
    if (footer) return gray;
  }

  if (isPropPath) return white;
};

export default bgColorFor;
