import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, delay, filter, Subject, tap } from 'rxjs';
import { Input as RouterInput } from '@angular/core'
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DatePicker } from 'primeng/datepicker';
import { TimelineModule } from 'primeng/timeline';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MapService } from '../../maps/services/map-service';
import { LoadProgressService } from '../../../services/load-progress.service';
import { MsToKmhPipe } from '../../../pipes/ms-to-km.pipe';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { LayoutService } from '../../../services/layout.service';
import { TranslateModule } from '@ngx-translate/core';
import { CitiesService } from '../services/cities.service';

@Component({
    selector: 'app-cities-detail',
    templateUrl: './cities-detail.component.html',
    styleUrls: ['./cities-detail.component.scss'],
    imports: [
        CommonModule,
        DrawerModule,
        ButtonModule,
        ToggleSwitchModule,
        DatePicker,
        TimelineModule,
        FormsModule,
        ReactiveFormsModule,
        MsToKmhPipe,
        TranslateModule
    ],
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesDetailComponent implements OnInit, OnDestroy {

    @RouterInput() id!: string;

    private _isMapSidebar = signal(true);
    public isVisibleRoute = false;
    public form: FormGroup;
    public data: any = {

    };
    public isSmallScreen: boolean;
    public isLargeScreen: boolean;
    public item: any;
    public isVisible = true;

    public points = [{ name: '-', coordinates: [], icon: 'from', type: 'loading' }, { name: '-', coordinates: [], icon: 'to', type: 'unloading' }];

    private _getTrack$ = new Subject<any>();
    private _destroy$ = new Subject<boolean>();

    constructor(
        private _fb: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private citiesService: CitiesService,
        private router: Router,
        private _loadProgressService: LoadProgressService,
        public mapService: MapService,
        private breakpointObserver: BreakpointObserver,
        public layoutService: LayoutService,

    ) {

        this._buildForm();
        this._watchForFormValueChanges()

        this.breakpointObserver
            .observe(['(min-width: 992px)', '(max-width: 767px)'])
            .pipe(delay(100))
            .subscribe((state: BreakpointState) => {
                this.isLargeScreen = state.breakpoints['(min-width: 992px)'];
                this.isSmallScreen = state.breakpoints['(max-width: 767px)'];
                this._cdr.detectChanges();
            });
    }

    public onClose() {
        this.isVisible = false;
        this.onHide();
        this._cdr.markForCheck();
    }

    public toggleSideBar(): void {
        this.layoutService.toggleSideBar();

    }

    public isMapSidebar = computed(() => this._isMapSidebar());

    public containerClass = computed(() => {
        return {
            'sidebar-active': this.isMapSidebar(),
        };
    });


    private _watchForFormValueChanges() {
        this.form.valueChanges
            .pipe(
                filter(() => this.form.valid),
                debounceTime(600),
                tap(() => this._getTrack$.next(this.form.value))
            )
            .subscribe()
    }



    public ngOnInit() {
        this.getById();
    }

    public getById() {
        this.citiesService.getById(this.id)
            .subscribe(city => {

                if (!city) return;

                this.item = city;

                this.mapService.focusCity$.next({
                    bbox: city.bbox,
                    center: city.center
                });

                this._cdr.markForCheck();
            });
    }

    public onHide() {
        this.router.navigate(['/']);
    }

    public ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
        this._cdr.markForCheck();

    }

    public onRoutes(): void {
        this.isVisibleRoute = !this.isVisibleRoute;
    }

    private _buildForm(): void {
        const now = new Date();
        const midnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0, 0, 0, 0
        );

        this.form = this._fb.group({
            start: [{ value: midnight, disabled: true }, [Validators.required]],
            end: [{ value: now, disabled: true }, [Validators.required]],
            isRepeat: [true, [Validators.required]],
        });
    }

}
