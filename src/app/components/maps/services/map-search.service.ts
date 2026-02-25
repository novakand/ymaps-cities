import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MapSearchService {

    private readonly API_KEY = '042405c2-12f5-4b78-9580-cb5ea1d7c106';

    constructor(private http: HttpClient) { }

    suggest(
        text: string,
        bounds?: [[number, number], [number, number]],
        types: string = 'geo,biz',
        limit: number = 10
    ): Observable<any[]> {

        const params: any = {
            apikey: 'cc9effc6-6507-4834-97f6-7384e3cd2df3',
            text,
            types,
            results: limit
        };

        if (bounds) {
            const [sw, ne] = bounds;
            params.bbox = `${sw[0]},${sw[1]}~${ne[0]},${ne[1]}`;
        }

        return this.http
            .get<any>('https://suggest-maps.yandex.ru/v1/suggest', { params })
            .pipe(
                map(res =>
                    (res.results || []).map((item: any) => {

                        const title = item.title?.text || '';
                        const subtitle = item.subtitle?.text || '';

                        return {
                            label: subtitle
                                ? `${title}, ${subtitle}`
                                : title,
                            rawLabel: title,
                            subtitle,
                            uri: item.uri
                        };
                    })
                )
            );
    }


    geocode(query: string): Observable<[number, number] | null> {
        if (!query?.trim()) return of(null);

        const params = {
            apikey: '042405c2-12f5-4b78-9580-cb5ea1d7c106',
            format: 'json',
            geocode: query,
            results: 1
        };

        return this.http
            .get<any>('https://geocode-maps.yandex.ru/1.x/', { params })
            .pipe(
                map(res => {
                    const feature =
                        res?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

                    if (!feature?.Point?.pos) return null;

                    const [lon, lat] =
                        feature.Point.pos.split(' ').map(Number);

                    return [lon, lat] as [number, number];
                }),
                catchError(() => of(null))
            );
    }
}