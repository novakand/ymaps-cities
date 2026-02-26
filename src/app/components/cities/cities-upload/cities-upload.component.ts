import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PrimeNG } from 'primeng/config';
import { FileUpload, FileUploadModule } from "primeng/fileupload";
import { BadgeModule } from 'primeng/badge';
import { CitiesSettingsService } from '../services/cities-settings.service';
import { TooltipModule } from 'primeng/tooltip';
@Component({
    selector: 'app-cities-upload',
    templateUrl: './cities-upload.component.html',
    styleUrls: ['./cities-upload.component.scss'],
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
        TranslateModule,
        FileUploadModule,
        BadgeModule,
        TooltipModule
    ],
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesUploadComponent implements OnInit, OnDestroy {

    @ViewChild('uploader', { static: true }) uploader: FileUpload;


    public files: any[] = [];
    public totalSize: number = 0;
    public totalSizePercent: number = 0;
    public uploadProgress: number = 0;

    private _destroy$ = new Subject<boolean>();

    constructor(
        private config: PrimeNG,
        private _dialogRef: DynamicDialogRef<CitiesUploadComponent>,
        private citiesSettingsService: CitiesSettingsService,
        public dialogService: DialogService,
        private _fb: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private citiesService: CitiesService,
        private router: Router,
        private _loadProgressService: LoadProgressService,
        public mapService: MapService,
        private breakpointObserver: BreakpointObserver,
        public layoutService: LayoutService,

    ) {

    }

    public onClose() {
        this._dialogRef.close();
        this._cdr.markForCheck();
    }

    public toggleSideBar(): void {
        this.layoutService.toggleSideBar();
    }


    public ngOnInit() {
        const stored = this.citiesSettingsService.getRaw();

        if (stored?.raw) {

            const blob = new Blob([stored.raw], { type: 'text/csv' });

            const file = new File(
                [blob],
                stored.fileName,   // 👈 используем настоящее имя
                { type: 'text/csv' }
            );

            this.uploader.clear();
            this.uploader.files.push(file);
            this.uploader.upload();

            this._cdr.detectChanges();
        }
    }


    public onDownload(event: any, file: any): void {
        if (!file) {
            return;
        }

        let fileName = file.name;
        const dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            fileName = fileName.substring(0, dotIndex);
        }

        const url = URL.createObjectURL(file);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

    public ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
        this._cdr.markForCheck();

    }


    public uploadFile(data: any): void {
        const { bbox, center, description, geometry, name, title } = data;
        if (!geometry) return;
        const jsonData = { bbox, center, description, geometry, name, title };
        const jsonStr = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const file = new File([blob], `${name}.json`, { type: 'application/json' });
        this.uploader.files = [];
        this.uploader.files.push(file);
        this.uploader.upload();
        this._cdr.detectChanges();
    }

    public formatSize(bytes: number): string {
        const k = 1024;
        const dm = 3;
        const sizes = <any>this.config.translation.fileSizeTypes;
        if (bytes === 0) {
            return `0 ${sizes[0]}`;
        }

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

        return `${formattedSize} ${sizes[i]}`;
    }

    public onSelectedFile(event: any): void {

        this.files = event.currentFiles;
        this.totalSize = 0;

        this.files.forEach((file: any) => {

            this.totalSize += file.size;

            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {

                const reader = new FileReader();

                reader.onload = (e: any) => {
                    try {

                        const rawCsv = e.target.result;
                        const rows = this.parseCsv(rawCsv);

                        this.citiesSettingsService.setFromCsv(
                            rows,
                            rawCsv,
                            file.name
                        );

                    } catch (error) {
                        console.error('CSV parse error:', error);
                    }
                };

                reader.readAsText(file);
            }
        });

        this.totalSizePercent = this.totalSize / 10;
        this._cdr.detectChanges();
    }



    public choose(event: any, chooseCallback: Function): void {
        chooseCallback();
    }

    public onRemove(event: any, file: any, removeFileCallback: any, index: number): void {
        removeFileCallback(event, index);
        this.uploader.clear();
        this.files = [];
        this.totalSize = 0;
        this.citiesSettingsService.clear();
        this._cdr.detectChanges();
    }

    public uploadEvent(callback): void {
        callback();
    }

    private parseCsv(text: string): { name: string; color: string }[] {

        const lines = text
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);

        if (lines.length < 2) return [];

        return lines.slice(1).map(line => {

            const cols = line.split(',');

            const city = cols[1]?.trim();      // B колонка
            const color = cols[3]?.trim();     // D колонка

            return {
                name: city,
                color: color
            };

        }).filter(r => r.name);
    }
}
