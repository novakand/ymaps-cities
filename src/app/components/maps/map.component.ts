// map.component.ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipModule } from 'primeng/chip';
import { bbox } from '@turf/turf';
import {
    YMapComponent,                     // <y-map>
    YMapDefaultSchemeLayerDirective,   // <y-map-default-scheme-layer>
    YMapDefaultFeaturesLayerDirective, // <y-map-default-features-layer>
    //  YMapDefaultMarkerDirective,
    // YMapMarkerDirective,           // <y-map-zoom-control>
} from 'angular-yandex-maps-v3';
import { RouterModule } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { MapSidebarComponent } from './components/map-sidebar/map-sidebar.component';
import { MapZoomControlComponent } from './components/map-zoom-control/map-zoom-control.component';
import { MapFullscreenComponent } from './components/map-fullscreen/map-fullscreen.component';
import { MapSettingsControlComponent } from './components/map-settings-control/map-settings-control.component';
import { MapService } from './services/map-service';
import { CitiesService, CityIndexItem } from '../cities/services/cities.service';
import { BehaviorSubject, catchError, combineLatest, debounceTime, delay, distinctUntilChanged, filter, forkJoin, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { BBox, Feature } from 'geojson';
import { MapEventManager } from './services/map-event-manager';
import { YMapFeatureDirective } from './directives/y-map-feature.directive';
import { YMapFeatureDataSourceDirective } from './directives/y-map-feature-data-source.directive';
import { YMapLayerDirective } from './directives/y-map-layer.directive';
import { MapLegendControlComponent } from './components/map-legend-control/map-legend-control.component';
import { RoutesService } from '../routes/services/routes.service';
import { YMapClustererDirective } from './directives/y-map-clusterer.directive';
import { YMapLocationRequest } from '@yandex/ymaps3-types';
import { LayoutService } from '../../services/layout.service';
import { YMapMouseDirective } from './directives/y-map-mouse.directive';
import type { HideOutsideRule } from '@yandex/ymaps3-types';
import { CollisionLabelDirective } from './directives/collision-label.directive';
import { MapSearchComponent } from './components/map-search/map-search.component';
import { YMapDefaultMarkerDirective } from './directives/y-map-default-marker.directive';
import { YMapMarkerDirective } from './directives/y-map-marker.directive';
import { CollisionManagerService } from './services/collision-manager.service';
import { YMapHintDirective } from './directives/y-map-hint.directive';
@Component({
    selector: 'app-map',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ChipModule,
        SkeletonModule,
        MapSidebarComponent,
        MapZoomControlComponent,
        MapSettingsControlComponent,
        MapSearchComponent,
        MapFullscreenComponent,
        YMapComponent,
        YMapDefaultSchemeLayerDirective,
        YMapDefaultFeaturesLayerDirective,
        YMapFeatureDataSourceDirective,
        YMapFeatureDirective,
        YMapLayerDirective,
        MapLegendControlComponent,
        YMapClustererDirective,
        YMapDefaultMarkerDirective,
        YMapMarkerDirective,
        YMapMouseDirective,
        CollisionLabelDirective,
        YMapHintDirective
    ],
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

//55.755864, 37.617698
export class MapComponent {
    public center = signal<[number, number]>([37.617698, 55.755864]); // [lng,lat]
    public zoom = signal<number>(4);
    public theme = signal<'light' | 'dark'>('light');
    public bounds = signal<[[number, number], [number, number]]>([[-83.8, -170.8], [83.8, 170.8]]);
    public zoomRange = signal({ min: 4, max: 19 });
    public isMapLoad = false;
    public isCityBoundaries = false;
    private map?: any;
    public isVisible = false;
    public encodeURIComponent = encodeURIComponent;
    public isVisibleSidebarBottom = false;
    public searchMarker?: any;
    public routeFeature: any;
    public markerFeatures: any;
    public features: any = [];
    private _initialBoundsApplied = false;
    public citiesFeatures: any | null = null;
    public cityMarkers: any[] = [];
    public fullscreenClass = 'layout-map-container';
    private _eventManager: MapEventManager = new MapEventManager(inject(NgZone));
    private _bounds = this._eventManager.getLazyEmitter<{
        object: any;
        event: { location: { bounds: any } };
    }>('onUpdate');
    private zoom$ = new BehaviorSubject<number>(this.zoom());
    private bounds$ = new BehaviorSubject<BBox | null>(null);
    private _destroy$ = new Subject<boolean>();

    constructor(
        public cdr: ChangeDetectorRef,
        private ngZone: NgZone,
        public mapService: MapService,
        private cities: CitiesService,
        public layoutService: LayoutService,
        private collisionService: CollisionManagerService
    ) {

        this.theme.set(this.layoutService.config().darkTheme ? 'dark' : 'light');
    }

    public onMapReady(ev: { entity: any; ymaps3: typeof ymaps3 }) {
        this.map = ev.entity;
        this.isMapLoad = true;
        this.mapService.load$.next(this.map);
        this._eventManager.setTarget(this.map);
        this.mapService.cityBoundaries$.next(true);
        this._watchFoDarkThemeChanges();
        this._watchForBoundsChanges();
        this._watchVisiblePolygons();
        this._watchForCityDataChanges();
        this._watchFoRemoveChanges();
        this._watchForFocusCityChanges();
        this._watchCityMarkers();
        this._onBoundsChange();
        this.cdr.detectChanges();

    }

    public onHint(object?: any) {
        return object?.properties?.hint;
    }

    private _watchFoDarkThemeChanges(): void {
        this.layoutService.configUpdate$
            .pipe(
                tap(() => this.theme.set(this.layoutService.config().darkTheme ? 'dark' : 'light'))
            )
            .subscribe();
    }

    private _watchFoRemoveChanges(): void {
        this.mapService.remove$
            .pipe(
                tap((isRemove) => {
                })
            )
            .subscribe()

    }

    private _watchForFocusCityChanges(): void {
        this.mapService.focusCity$
            .pipe(filter(Boolean))
            .subscribe((data: any) => {

                if (!this.map) return;

                if (data.bbox) {
                    const [minLng, minLat, maxLng, maxLat] = data.bbox;

                    this.fitBounds([
                        [minLng, minLat],
                        [maxLng, maxLat]
                    ]);
                }
                else if (data.center) {
                    this.map.update({
                        location: {
                            center: data.center,
                            zoom: 10,
                            easing: 'ease-in-out',
                            duration: 900
                        }
                    });
                }
            });
    }


    onLocationSelected(item: any) {
        this.searchMarker = {
            id: 'search-marker',
            coordinates: item.coordinates,
            title: item.label || 'Найдено',
            color: '#E63D2E'
        };

        this.map?.update({
            location: {
                center: item.coordinates,
                zoom: 14,
                duration: 400
            }
        });
    }

    onLocationCleared() {
        this.searchMarker = null;
    }
    private _watchForBoundsChanges(): void {
        this._bounds.pipe(
            map(e => e?.event?.location?.bounds as [[number, number], [number, number]] | undefined),
            filter((b): b is [[number, number], [number, number]] => Array.isArray(b)),
            map(b => this.toBBox(b).map(x => +x.toFixed(5))),
            map(arr => arr.join('|')),
            distinctUntilChanged(),
            debounceTime(100),
            takeUntil(this._destroy$)
        )
            .subscribe(() => this._onBoundsChange());
    }


    private _watchCityMarkers(): void {
        combineLatest([
            this.cities.findEnabled(),
            this.mapService.cityColorFilter$
        ])
            .pipe(takeUntil(this._destroy$))
            .subscribe(([list, colorFilter]) => {


                const filtered = colorFilter?.length
                    ? list.filter((c: any) => colorFilter.includes(c.color))
                    : list;

                this.cityMarkers = filtered.map((city: any, index: number) => ({
                    id: city.label,
                    coordinates: city.center,
                    title: city.name,
                    color: city.color || '#E63D2E',
                    subtitle: city.region?.name,
                }));

                this.collisionService.forceUpdate();

                if (!this._initialBoundsApplied && this.cityMarkers.length && this.map) {
                    const features = this.cityMarkers.map((m: any) => ({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: m.coordinates
                        },
                        properties: {}
                    }));

                    //@ts-ignore
                    const bounds = this.buildBoundsFromGeoJSON(features);

                    if (bounds) {
                        // this.fitBounds(bounds);
                    }
                }

                this.cdr.detectChanges();
            });
    }


    private getMarkerOffset(zoom: number, index: number): [number, number] {

        if (zoom >= 5) return [0, 0];

        const radius = zoom <= 3 ? 18 : 10;

        const angle = (index * 40) * (Math.PI / 180);

        const x = Math.round(Math.cos(angle) * radius);
        const y = Math.round(Math.sin(angle) * radius);

        return [x, y];
    }

    private _watchForCityDataChanges(): void {
        this.mapService.cityBoundaries$
            .pipe(distinctUntilChanged(), takeUntil(this._destroy$))
            .subscribe(show => {
                this.isCityBoundaries = show;
                this.cdr.detectChanges();
                if (show) {
                    this._onBoundsChange();
                } else {
                    this.remove();
                }
            });
    }

    public fitBounds(bounds) {
        this.map.update({ location: { bounds, ...{ easing: 'ease-in-out', duration: 600, } } });
    }


    private buildBoundsFromGeoJSON(
        input:
            | GeoJSON.Feature
            | GeoJSON.Feature[]
            | GeoJSON.FeatureCollection
    ): [[number, number], [number, number]] | null {

        if (!input) return null;

        let featureCollection: GeoJSON.FeatureCollection;

        if (Array.isArray(input)) {
            if (!input.length) return null;

            featureCollection = {
                type: 'FeatureCollection',
                features: input
            };
        }
        else if (input.type === 'FeatureCollection') {
            if (!input.features?.length) return null;
            featureCollection = input;
        }
        else {
            featureCollection = {
                type: 'FeatureCollection',
                features: [input]
            };
        }

        const [minX, minY, maxX, maxY] = bbox(featureCollection);

        return [
            [minX, minY],
            [maxX, maxY]
        ];
    }

    private _onBoundsChange(): void {
        if (!this.map) return;
        this.bounds$.next(this.toBBox(this.map?.bounds));
        this.zoom$.next(this.map?.zoom);
    }

    public withAlpha = (hex: string, a: number) =>
        hex + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0').toUpperCase();

    private toBBox(b: [[number, number], [number, number]]): [number, number, number, number] {
        const west = b[0][0];
        const north = b[0][1];
        const east = b[1][0];
        const south = b[1][1];
        return [west, south, east, north]; // [minLon, minLat, maxLon, maxLat]
    }

    private featureId(feat: any, j: number): string {
        const gc = feat?.properties?.geocoding ?? {};
        if (gc?.place_id != null) return String(gc.place_id);
        if (gc?.osm_id != null && gc?.osm_type) return `${gc.osm_type}:${gc.osm_id}`;
        return `idx:${String(j)}`;
    }

    public remove() {
        this.citiesFeatures = [];
        this.cdr.detectChanges();
        return { type: 'FeatureCollection', features: [] };
    }

    public removeMarkers(): void {
        this.markerFeatures = [];
        this.cdr.markForCheck();
    }

    public removeRoute(): void {
        this.routeFeature = null;
        this.cdr.detectChanges();
    }

    public removeClusters(): void {
        this.features = [];
        this.cdr.detectChanges();
    }


    private _watchVisiblePolygons(): void {
        combineLatest([
            this.cities.findEnabled(),
            this.mapService.cityBoundaries$,
            this.mapService.cityColorFilter$
        ])
            .pipe(
                takeUntil(this._destroy$),
                switchMap(([list, show, colorFilter]) => {

                    if (!show) {
                        this.citiesFeatures = [];
                        this.cdr.markForCheck();
                        return of(null);
                    }

                    const filtered = colorFilter?.length
                        ? list.filter((c: any) => colorFilter.includes(c.color))
                        : list;

                    if (!filtered.length) {
                        this.citiesFeatures = [];
                        this.cdr.markForCheck();
                        return of(null);
                    }

                    return forkJoin(
                        filtered.map((city: any) =>
                            this.cities.getPolygon(String(city.label)).pipe(
                                map(fc => ({
                                    fc,
                                    color: city.color
                                })),
                                catchError(() =>
                                    of({
                                        fc: { type: 'FeatureCollection', features: [] },
                                        color: city.color
                                    })
                                )
                            )
                        )
                    );
                })
            )
            .subscribe(results => {

                if (!results) return;

                const uniq = new Map<string, any>();

                results.forEach(({ fc, color }) => {
                    (fc.features ?? []).forEach((feat: any, j: number) => {
                        const id = this.featureId(feat, j);

                        if (!uniq.has(id)) {
                            uniq.set(id, {
                                id,
                                geometry: feat.geometry,
                                properties: feat.properties ?? {},
                                color
                            });
                        }
                    });
                });

                this.citiesFeatures = Array.from(uniq.values()).map(f => {

                    const base = f.color || '#4CAF50';

                    return {
                        id: f.id,
                        geometry: f.geometry,
                        properties: f.properties,
                        style: {
                            stroke: [{
                                color: this.darken(base, 0.35),
                                width: 2,
                                opacity: 1
                            }],
                            fill: this.withAlpha(base, 0.28)
                        }
                    };
                });

                this.collisionService.forceUpdate();

                this.cdr.markForCheck();
            });
    }


    private darken(hex: string, amount: number): string {
        const num = parseInt(hex.replace('#', ''), 16);

        let r = (num >> 16) & 0xff;
        let g = (num >> 8) & 0xff;
        let b = num & 0xff;

        r = Math.max(0, Math.floor(r * (1 - amount)));
        g = Math.max(0, Math.floor(g * (1 - amount)));
        b = Math.max(0, Math.floor(b * (1 - amount)));

        return '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
    }

    private _intersects(a: BBox, b: BBox): boolean {
        const norm = ([w, s, e, n]: BBox): BBox => [
            Math.min(w, e),
            Math.min(s, n),
            Math.max(w, e),
            Math.max(s, n)
        ];

        const [ax1, ay1, ax2, ay2] = norm(a);
        const [bx1, by1, bx2, by2] = norm(b);

        return ax1 <= bx2 && ax2 >= bx1 && ay1 <= by2 && ay2 >= by1;
    }

    public onVisibleChangeSidebar(event: boolean) {
        this.isVisible = event;
    }

    public onChangeSettings(_: any): void {
        this.isVisible = !this.isVisible;
    }

    public onChangeSidebarBottom(event: boolean) {
        this.isVisibleSidebarBottom = event;
    }


    trackById = (_: number, f: any) => f.id;
    trackByMarkerId(index: number, marker: any): string {
        return marker.id;
    }
}
