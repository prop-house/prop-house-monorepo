import fileDefault from '../../assets/files/file-blank.png';
import fileJpg from '../../assets/files/jpg.png';
import fileJpeg from '../../assets/files/jpg.png';
import filePng from '../../assets/files/png.png';
import fileGif from '../../assets/files/gif.png';
import fileSvg from '../../assets/files/svg.png';
import fileMov from '../../assets/files/mov.png';

interface ImageConfig {
  [key: string]: string;
}

export const imageConfig: ImageConfig = {
  default: fileDefault,
  png: filePng,
  jpg: fileJpg,
  jpeg: fileJpeg,
  gif: fileGif,
  svg: fileSvg,
  'svg+xml': fileSvg,
  quicktime: fileMov,
};
