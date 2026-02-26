import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { ListboxModule } from 'primeng/listbox';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { IsTextOverflowingPipe } from '../../../pipes/text-overflowing.pipe';
import { delay, filter } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { LayoutService } from '../../../services/layout.service';
import { TranslateModule } from '@ngx-translate/core';
import { DrawerModule } from 'primeng/drawer';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Menu } from 'primeng/menu';
import { MapService } from '../../maps/services/map-service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CitiesService } from '../services/cities.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BadgeModule } from 'primeng/badge';
import { PrimeNG } from 'primeng/config';
import { CitiesUploadComponent } from '../cities-upload/cities-upload.component';
@Component({
    selector: 'app-cities-list',
    standalone: true,
    templateUrl: './cities-list.component.html',
    styleUrls: ['./cities-list.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        ToggleSwitchModule,
        FormsModule,
        TooltipModule,
        ButtonModule,
        IsTextOverflowingPipe,
        ReactiveFormsModule,
        PanelModule,
        ListboxModule,
        SkeletonModule,
        TranslateModule,
        DrawerModule,
        SelectButtonModule,
        BadgeModule
    ],
    providers: [DialogService]
})
export class CitiesListComponent implements OnInit {

    public active: any = null;
    public form: FormGroup;
    public data: any[] = [];
    public noProgress: boolean;
    public inProgress: boolean;
    public dialog: any;
    public skeletons = Array(12);
    public isSmallScreen: boolean;
    public visible: boolean = false;
    public isSettings = false;
    public count = 0;
    public allCities: any[] = [];
    public filteredCities: any[] = [];
    public colorOptions: any[] = [];
    public selectedColors: string[] = [];

    value: any;

    justifyOptions: any[] = [
        { icon: 'pi pi-circle-on', justify: 'Left' },
        { icon: 'pi pi-circle-on', justify: 'Right' },
        { icon: 'pi pi-circle-on', justify: 'Center' },
    ];
    constructor(
        private _cdr: ChangeDetectorRef,
        private _fb: FormBuilder,
        private citiesService: CitiesService,
        private _mapService: MapService,
        private router: Router,
        public dialogService: DialogService,
        private breakpointObserver: BreakpointObserver,
        public layoutService: LayoutService,
    ) {

        this.breakpointObserver
            .observe(['(min-width: 992px)', '(max-width: 767px)'])
            .pipe(delay(100))
            .subscribe((state: BreakpointState) => {
                this.isSmallScreen = state.breakpoints['(max-width: 767px)'];

            });
        this._buildForm();
    }

    public ngOnInit() {
        this.citiesService.findEnabled()
            .pipe(delay(50))
            .subscribe(data => {
                this.allCities = data;

                const uniqueColors = Array.from(
                    new Set(data.map((c: any) => c.color || '#E63D2E'))
                );

                this.colorOptions = uniqueColors.map(color => ({
                    label: '',
                    value: color,
                    color
                }));

                //@ts-ignore
                this.selectedColors = [...uniqueColors];

                this._applyFilter();
            });
    }


    public onUpload(): void {
        const ref = this.dialogService.open(CitiesUploadComponent, {
            data: { ref: 'null' },
            width: '40vw',
            modal: true,
            height: '26rem',
            draggable: true,
            closable: true,
            maximizable: false,
            header: 'Загрузить список городов',
            contentStyle: {
                overflow: 'hidden',
                padding: 'var(--p-dialog-content-padding)'
            },
            // showHeader: false,
            focusOnShow: false,
            styleClass: '',
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
                '390px': '90vw'
            },
        });

        ref.onClose.
            pipe(filter(Boolean)).
            subscribe((data: any) => {
                const { action, form } = data || {};
                console.log(form, '')
                // action === PanelAction.SAVE && this.addVehicles(form);
            });
    }

    public onColorChange(): void {
        this._applyFilter();
    }

    private _applyFilter(): void {
        this.filteredCities = this.allCities.filter(c =>
            this.selectedColors.includes(c.color)
        );

        this.count = this.filteredCities.length;
        this._mapService.cityColorFilter$.next(this.selectedColors);

        this._cdr.markForCheck();
    }

    public onChange({ value }: any): void {
        this.router.navigate(['city', value.id]);
    }

    public onOpen(): void {
        this.visible = !this.visible;
    }

    public toggleSideBar(): void {
        this.layoutService.toggleSideBar();

    }

    private _buildForm(): void {
        this.form = this._fb.group({
            isCities: new FormControl(true),

        });
    }

}
