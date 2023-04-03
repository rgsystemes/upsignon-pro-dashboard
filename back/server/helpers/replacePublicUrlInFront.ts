import fs from 'fs';
import path from 'path';
import env from './env';

const replacePublicUrlInFile = (file: any): void => {
    if (env.SERVER_URL) {
        fs.readFile(file, 'utf-8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace(
                /PUBLIC_URL/g,
                // @ts-ignore
                env.SERVER_URL,
            );
            fs.writeFile(file, result, 'utf8', function (err) {
                if (err) return console.log(err);
            });

        });
    }
}

export const replacePublicUrlInFront = (frontBuildDir: any) => {
    replacePublicUrlInFile(path.join(frontBuildDir, 'asset-manifest.json'));
    replacePublicUrlInFile(path.join(frontBuildDir, 'index.html'));
}