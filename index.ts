import express, { Express, Request, Response } from 'express';
import axios from 'axios';
import { setTimeout } from "timers/promises";
import querystring from 'querystring';

const app: Express = express();
app.use(express.json());
const PORT = 3000;

axios.defaults.headers.common['X-ZAP-API-Key'] = 'testeapi';
axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

const spiderScan = async (params: any) => {
    const endpoint = 'spider/action/scan/';
    return (await zaproxyAxiosPostRequest(endpoint, params)).data.scan;
}

const spiderSatus = async (params: any) => {
    const endpoint = 'spider/view/status/';
    return (await zaproxyAxiosPostRequest(endpoint, params)).data.status;
}

const ascanScan = async (params: any) => {
    const endpoint = 'ascan/action/scan/';
    return (await zaproxyAxiosPostRequest(endpoint, params)).data.scan;
}

const ascanStatus = async (params: any) => {
    const endpoint = 'ascan/view/status/';
    return (await zaproxyAxiosPostRequest(endpoint, params)).data.status;
}

const zaproxyAxiosPostRequest = async (endpoint: String, params: any) => {
    return await axios.post(`http://localhost:8080/JSON/${endpoint}`,
        querystring.stringify(params)
    );
}

app.post('/scan', async (req: Request, res: Response) => {
    const urlScan = { url: req.body.baseUrl };
    let spiderScanId = await spiderScan(urlScan);
    let spiderStatusValue = await spiderSatus(spiderScanId);
    while (spiderStatusValue < 100) {
        await setTimeout(2000);
        spiderStatusValue = await spiderSatus(spiderScanId);
    }
    const ascanScanId = await ascanScan(urlScan);
    res.json(ascanScanId);
});

app.get('/scan/report/:scandId', async (req: Request, res: Response) => {
    const scanId = { scanId: req.params.scanId };
    const ascanStatusValue = await ascanStatus(scanId);
    if (ascanStatusValue < 100) {
        return res.json("Scanning is not finished yet, please wait and try again in a few minutes.");
    }

    // TODO recuperar o relatório
    res.json();
});

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}/`);
});