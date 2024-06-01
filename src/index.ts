import fetch from "node-fetch";
import { load } from "cheerio";
import { osu_uri } from "./helpers/constants";

export class Otsu {

    /**
    * @returns array contain x-csrf-token and osu-session
    */
    async Osu_cookie ()
    {
        try {

            const req = await fetch(osu_uri, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                  'Accept-Encoding': 'gzip, deflate, br, zstd',
                  'accept-language': 'en-US,en;q=0.9',
                }
            });

            return req.headers.raw()['set-cookie'].map(cookie => cookie.split(';')[0]);
            
        } catch (e) {
            return e;
        }
    }

    /**
     * @param {string} username - osu username
     */
    async Osu_userdata (username: string)
    {
        try {

            let cookie = await this.Osu_cookie();

            const req = await fetch(osu_uri + '/users/' + username, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                  'Accept-Encoding': 'gzip, deflate, br, zstd',
                  'accept-language': 'en-US,en;q=0.9',
                  'Cookie': `${cookie[0]}; ${cookie[1]}`
                }
            });

            if (req.status == 404) {
                return { errors: 'username not found' }
            } else if (req.status == 200) {

                const request = await fetch(req.url, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                      'Accept-Encoding': 'gzip, deflate, br, zstd',
                      'accept-language': 'en-US,en;q=0.9',
                      'Cookie': `${cookie[0]}; ${cookie[1]}`
                    }
                });

                const result = await request.text();
                const $ = load(result);

                const data = $('.osu-layout--full').attr('data-initial-data');

                return JSON.parse(`${data}`);
                
            } else {
                return { errors: 'unknown errors' }
            }
            
        } catch (e) {
            return e;
        }
    }

}