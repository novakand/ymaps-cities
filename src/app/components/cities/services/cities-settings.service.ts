import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CitiesSettingsService {

    private readonly STORAGE_KEY = 'cities-settings';

    private readonly settings$ = new BehaviorSubject<Record<string, string>>({});

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw);

            // если новый формат
            if (parsed.settings) {
                this.settings$.next(parsed.settings);
            }
            // если старый формат (на всякий случай)
            else {
                this.settings$.next(parsed);
            }

        } catch (e) {
            console.error('CitiesSettings parse error', e);
            this.settings$.next({});
        }
    }

    public hasSettings(): boolean {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return !!raw;
    }

    private save(settings: Record<string, string>): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
        this.settings$.next(settings);
    }

    getSettings(): Observable<Record<string, string>> {
        return this.settings$.asObservable();
    }


    getRaw(): { raw: string; size: number; fileName: string } | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return {
        raw: parsed.raw,
        size: parsed.size,
        fileName: parsed.fileName || 'cities-settings.csv'
    };
}

    setFromCsv(
  rows: { name: string; color: string }[],
  rawCsv: string,
  originalFileName: string
): void {

    const map: Record<string, string> = {};

    rows.forEach(r => {
        if (r.name) {
            map[r.name] = r.color || '';
        }
    });

    const payload = {
        settings: map,
        raw: rawCsv,
        size: new Blob([rawCsv]).size,
        fileName: originalFileName,   // 👈 сохраняем имя
        uploadedAt: Date.now()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    this.settings$.next(map);
}

    clear(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        this.settings$.next({});
    }
}