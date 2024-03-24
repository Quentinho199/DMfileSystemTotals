import * as fs from 'fs';
import * as path from 'path';
const date = new Date().toLocaleDateString('en-GB');
const dossierStores = './stores/';
const chemin = 'salesTotals';
const fichierTotal = 'totals.txt';
const cheminComplet = './'+chemin+'/'+fichierTotal;
const args = process.argv.slice(2);
const dossierIndique = args.length > 0 ? args[0] : dossierStores;
let total = 0;

async function readJsonFiles(dossier) {
    const files = await fs.promises.readdir(dossier, { withFileTypes: true });

    let promises = files.map(file => {
        return new Promise(async (resolve, reject) => {
            const fullPath = path.join(dossier, file.name);

            if (file.isDirectory()) {
                await readJsonFiles(fullPath);
                resolve();
            } else if (path.extname(fullPath) === '.json') {
                fs.readFile(fullPath, 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        const jsonData = JSON.parse(data);
                        total += jsonData.total;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });

    return Promise.all(promises);
}

readJsonFiles(dossierIndique)
    .then(() => {
        if (fs.existsSync(cheminComplet)) {
            console.log('salesTotals already exists.');
            fs.appendFileSync('./'+chemin+'/'+fichierTotal, `Total at ${date} from ${dossierIndique} : ${total}€\n`);
        } else {
            fs.appendFileSync('./'+chemin+'/'+fichierTotal, `Total at ${date} from ${dossierIndique} : ${total}€\n`);
        }
        console.log(`Wrote sales totals ${total}€ to ${chemin}`);
    })
    .catch(console.error);