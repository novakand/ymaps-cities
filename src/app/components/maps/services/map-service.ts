import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class MapService {

    public load$ = new BehaviorSubject<any>(null);
    public remove$ = new BehaviorSubject<any>(null);
    public cityBoundaries$ = new BehaviorSubject<boolean>(false);
   public focusCity$ = new BehaviorSubject<any>(null);
    public clusterData$ = new BehaviorSubject<any>(null);
public cityColorFilter$ = new BehaviorSubject<string[] | null>(null);
}
