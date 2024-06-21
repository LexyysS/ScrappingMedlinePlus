import { chromium } from 'playwright';
import fs from 'fs';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const baseURL = 'https://medlineplus.gov/spanish/ency/encyclopedia_';

(async () => {
    const browser = await chromium.launch(
        { headless: true }
    );
    const page = await browser.newPage();
    const data = [];

   
    for (const letter of alphabet) {
        const url = `${baseURL}${letter}.htm`;
        await page.goto(url);

        //https://medlineplus.gov/spanish/ency/encyclopedia_A.htm
        console.log(`Scraping letter: ${url}`);

        const enfermedades = await page.$$eval(
            '.g-m',
            (results) => (
                results.map((result) => {

                    
                
                    const href = result.querySelector('a')?.href

                    return href

                    
                })
            )

        )
    

        for (const articleURL of enfermedades) {
            console.log(`Scraping article: ${articleURL}`);
            await page.goto(articleURL);

            
            const title = await page.$eval('.page-title h1', h1 => h1.innerText);
            const definicion = await page.$eval('#ency_summary p', p => p.innerText);


            const sections = await page.$$eval('.section', 
                sections => (
                sections.map(section => {
                    const sectionTitle = section.querySelector('.section-header .section-title h2')?.innerText;
                    const sectionBody = Array.from(section.querySelectorAll('.section-body p, .section-body li'))
                        .map(element => element.innerText);
                    return {
                        sectionTitle: sectionTitle,
                        sectionBody: sectionBody
                    };
                })
            )
            )

            data.push({
                titulo: title,
                definicion: definicion,
                secciones: sections
            });

            console.log(`Scraped article: ${title}`);
        }
        
    }
    
    await browser.close();

    const jsonData = JSON.stringify(data, null, 4);
    fs.writeFileSync('medlineplus_enciclopedia.json', jsonData, 'utf-8');

    console.log("Datos guardados en 'medlineplus_enciclopedia.json'");
})();