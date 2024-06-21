const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const baseURL = 'https://medlineplus.gov/spanish/ency/encyclopedia_A.htm';

const fetchData = async (url) => {
    try {
        const response = await axios.get(url);
        return cheerio.load(response.data);
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null;
    }
};

const scrapeMedlinePlus = async () => {
    const mainPage = await fetchData(baseURL);
    if (!mainPage) return;

    const articleLinks = mainPage('.alpha-list a')
        .map((i, link) => mainPage(link).attr('href'))
        .get();

    const data = [];

    for (const link of articleLinks) {
        const articleURL = `https://medlineplus.gov/spanish/${link}`;
        const articlePage = await fetchData(articleURL);
        if (!articlePage) continue;

        const title = articlePage('h1').text().trim();
        const content = articlePage('.text').text().trim();

        data.push({
            title: title,
            content: content,
        });

        console.log(`Scraped article: ${title}`);
    }

    const jsonData = JSON.stringify(data, null, 4);
    fs.writeFileSync('medlineplus_enciclopedia.json', jsonData, 'utf-8');

    console.log("Datos guardados en 'medlineplus_enciclopedia.json'");
};

scrapeMedlinePlus();