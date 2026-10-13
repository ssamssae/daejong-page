import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
fs.writeFileSync('public/brand-consumer.json',JSON.stringify({schema:1,site:'work',commit,catalog:'https://kangdaejong.com/brand/products/catalog.json'},null,2)+'\n');
