import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Feature, Point } from 'geojson';
import { CitiesSettingsService } from './cities-settings.service';
type BBox = [number, number, number, number];
type LonLat = [number, number];

export interface CityIndexItem {
    slug: string;
    name: string;
    id: string;
    region?: string;
    label: string;
    center?: LonLat;
    bbox?: BBox;

}

export interface FeatureCollection {
    type: 'FeatureCollection';
    features: any[];
    bbox?: BBox;
}

export type CityFeature = Feature<Point, any>;

@Injectable({ providedIn: 'root' })
export class CitiesService {

    constructor(private http: HttpClient,
        private settingsService: CitiesSettingsService
    ) { }

    private readonly BASE = 'assets/data';
    private readonly INDEX_URL = `${this.BASE}/cities.features.json`;
    private readonly POLYGONS_DIR = `${this.BASE}/polygons`;

    private readonly features$ = this.http.get<CityFeature[]>(this.INDEX_URL).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
    );

    private readonly cities$ = this.features$.pipe(
        map(features =>
            features.map(f => ({
                ...f.properties,
                slug: f.properties?.label,
                center: f.geometry?.coordinates,
                bbox: f.properties?.bbox,
                enabled: f.properties?.enabled
            }))
        ),
        shareReplay({ bufferSize: 1, refCount: true })
    );


    private readonly mergedCities$ = combineLatest([
        this.cities$,
        this.settingsService.getSettings()
    ]).pipe(
        map(([cities, settings]) => {

            // если пользовательских настроек нет → дефолт
            if (!Object.keys(settings).length) {
                return cities.filter(c => c.enabled !== false);
            }

            return cities
                .map(city => {

                    const hasCustom = Object.prototype.hasOwnProperty.call(settings, city.name);
                    const customColor = settings[city.name];

                    return {
                        ...city,
                        enabled: hasCustom,
                        color: hasCustom && customColor
                            ? customColor
                            : city.color
                    };

                })
                .filter(c => c.enabled);

        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    findEnabled(): Observable<CityIndexItem[]> {
        return this.mergedCities$;
    }

    private readonly polyCache = new Map<string, Observable<FeatureCollection>>();

    findAll(): Observable<any[]> {
        return this.cities$;
    }

    getById(id: string): Observable<CityIndexItem | undefined> {
        return this.cities$.pipe(
            map(list => list.find(c => c.id === id))
        );
    }

    getBySlug(slug: string): Observable<any | undefined> {
        return this.cities$.pipe(
            map(list => list.find(c => c.slug === slug))
        );
    }

    search(query: string): Observable<any[]> {
        const q = (query || '').toLowerCase().trim();
        if (!q) return this.cities$;

        return this.cities$.pipe(
            map(list =>
                list.filter(c =>
                    (c.name || '').toLowerCase().includes(q) ||
                    (c.region?.name || '').toLowerCase().includes(q)
                )
            )
        );
    }

    getFeatures(): Observable<CityFeature[]> {
        return this.features$;
    }

    getPolygon(slugOrLabel: string): Observable<FeatureCollection> {
        const key = String(slugOrLabel);

        if (this.polyCache.has(key)) {
            return this.polyCache.get(key)!;
        }

        const url = `${this.POLYGONS_DIR}/${key}.json`;

        const req$ = this.http.get<FeatureCollection>(url).pipe(
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this.polyCache.set(key, req$);
        return req$;
    }
}