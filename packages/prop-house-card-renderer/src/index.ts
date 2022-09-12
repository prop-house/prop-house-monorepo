import express from 'express'
import puppeteer from 'puppeteer';
import fs from 'fs'
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';

type Config = {
    port: number,
    webAppBase: string,
    apiBase: string,
    cachePath: string,
    cardHeight: number,
    cardWidth: number
}

const config: Config = {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    webAppBase: process.env.WEB_APP_BASE ?? "https://prop.house",
    apiBase: process.env.ABI_BASE ?? "https://prod.backend.prop.house",
    cachePath: process.env.CACHEPATH ?? "/tmp/phcache",
    cardHeight: process.env.CARD_HEIGHT ? Number(process.env.CARD_HEIGHT) : 512,
    cardWidth: process.env.CARD_WIDTH ? Number(process.env.CARD_WIDTH) : 1024,
}

const wrapper = new PropHouseWrapper(config.apiBase)

/**
 * Generate raw HTML to be rendered for the Prop House Card locally using the Prop
 * House wrapper library. Edit this to change the `/:id/local` card.
 */
const localHtml = async (propId: string) => {
    const proposal = await wrapper.getProposal(Number(propId));

    return `
<html>
<h1>${proposal.title}</h1>
</html>
`
}

const remoteCardUrl = (propId: string) => [config.webAppBase, "proposal", propId, "card"].join('/')

const cachePath = (propId: string) => [config.cachePath, [propId.replace(/\.\//g, ""), "png"].join('.')].join("/")

const generateLocal = async (req: express.Request<{ propId: string }>, res: express.Response) => {
    const { propId } = req.params;
    const html = await localHtml(propId);
    const path = cachePath(propId)

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.emulate({
        viewport: {
            width: config.cardWidth,
            height: config.cardHeight
        },
        userAgent: "PropHouseSnapshotBot"
    })
    await page.setContent(html)
    await page.screenshot({ path });

    await browser.close();
    res.header("X-PropHouse-Type", "local")
        .header("Content-Type", "image/png")
        .send(fs.readFileSync(path))
}

const generateRemote = async (req: express.Request<{ propId: string }>, res: express.Response) => {
    const { propId } = req.params;
    const path = cachePath(propId)

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.emulate({
        viewport: {
            width: config.cardWidth,
            height: config.cardHeight
        },
        userAgent: "PropHouseSnapshotBot"
    })
    await page.goto(remoteCardUrl(propId), {
        waitUntil: "networkidle0"
    })
    await page.screenshot({ path });

    await browser.close();
    res.header("X-PropHouse-Type", "local")
        .header("Content-Type", "image/png")
        .send(fs.readFileSync(path))
}

(async () => {
    const app = express();

    app.get('/', (req, res) => {
        res.send("Welcome to Prop House card renderer")
    })

    app.get('/:propId', generateLocal)
    app.get('/:propId/remote', generateRemote)
    app.get('/:propId/local', generateLocal)


    app.listen(config.port, () => {
        console.log(`Listening on ${config.port}`)
    })

})()