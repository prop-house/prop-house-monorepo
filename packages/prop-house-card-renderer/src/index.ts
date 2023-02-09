import express from 'express';
import puppeteer, { Browser, PuppeteerLifeCycleEvent } from 'puppeteer';
import fs from 'fs';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';

type Config = {
  port: number;
  webAppBase: string;
  apiBase: string;
  cachePath: string;
  cardHeight: number;
  cardWidth: number;
  remoteWaitUntil: PuppeteerLifeCycleEvent;
};

const config: Config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3002,
  webAppBase: process.env.WEB_APP_BASE ?? 'https://prop.house',
  apiBase: process.env.ABI_BASE ?? 'https://prod.backend.prop.house',
  cachePath: process.env.CACHE_PATH ?? '/tmp/phcache',
  cardHeight: process.env.CARD_HEIGHT ? Number(process.env.CARD_HEIGHT) : 512,
  cardWidth: process.env.CARD_WIDTH ? Number(process.env.CARD_WIDTH) : 1024,
  remoteWaitUntil: (process.env.REMOTE_WAIT_UNTIL as PuppeteerLifeCycleEvent) ?? 'networkidle0',
};

const wrapper = new PropHouseWrapper(config.apiBase);

/**
 * Generate raw HTML to be rendered for the Prop House Card locally using the Prop
 * House wrapper library. Edit this to change the `/:id/local` card.
 */
const localHtml = async (propId: string) => {
  const proposal = await wrapper.getProposal(Number(propId));

  return `
<html>
<h1>${proposal.title}</h1>
<p>${proposal.tldr}</p>
</html>
`;
};

const remoteCardUrl = (path: string) => [config.webAppBase, path, 'card'].join('/');

const cachePath = (propId: string) =>
  [config.cachePath, [propId.replace(/\.\//g, '').replace(/\//g, '_'), 'png'].join('.')].join('/');

const generateLocal = async (req: express.Request<{ propId: string }>, res: express.Response) => {
  const { propId } = req.params;
  const html = await localHtml(propId);
  const path = cachePath(propId);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.emulate({
    viewport: {
      width: config.cardWidth,
      height: config.cardHeight,
    },
    userAgent: 'PropHouseSnapshotBot',
  });
  await page.setContent(html);
  await page.screenshot({ path });

  await browser.close();
  res
    .header('X-PropHouse-Type', 'local')
    .header('Content-Type', 'image/png')
    .send(fs.readFileSync(path));
};

const generateRemote =
  (browser: Browser) => async (req: express.Request, res: express.Response) => {
    const path = req.params[0];
    const cacheFilePath = cachePath(path);

    const page = await browser.newPage();
    page.emulate({
      viewport: {
        width: config.cardWidth,
        height: config.cardHeight,
      },
      userAgent: 'PropHouseSnapshotBot',
    });
    console.log(remoteCardUrl(path));
    await page.goto(remoteCardUrl(path), {
      waitUntil: config.remoteWaitUntil,
    });
    await page.screenshot({ path: cacheFilePath });

    res
      .header('X-PropHouse-Type', 'local')
      .header('Content-Type', 'image/png')
      .send(fs.readFileSync(cacheFilePath));
  };

(async () => {
  const browser = await puppeteer.launch();
  const app = express();

  app.get('/', (req, res) => {
    res.send('Welcome to Prop House card renderer');
  });

  app.get('/remote/*', generateRemote(browser));
  app.get('/:propId/local', generateLocal);

  app.listen(config.port, () => {
    console.log(`Listening on ${config.port}`);
  });
})();
