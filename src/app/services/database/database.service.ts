import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Community } from 'src/app/models/enums/location.enum';
import { StandType } from 'src/app/models/enums/stand-type.enum';
import { StandModel } from 'src/app/models/stand-model';
import { fakeStands } from 'src/app/search-page/search-results/stands/mockStands';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  // stands BehaviorSubject
  private _stands = new BehaviorSubject<StandModel[]>([]);
  private readonly _communityFilters = new BehaviorSubject<Community>(
    Community.none
  );
  private readonly _isSoldFilters = new Subject<boolean>();
  private readonly _standTypeFilters = new BehaviorSubject<StandType>(
    StandType.Residential
  );

  //
  stands$ = this._stands.asObservable();

  // goes out to state
  get stands(): StandModel[] {
    return this._stands.getValue();
  }

  constructor() {}

  // For search suggestions
  getAllStandLocations(): Observable<string[]> {
    // this.pushToObservable(fakeStands);

    // filter array of objects and return surbubs
    let suburbs: string[] = fakeStands.map((stand) => stand.suburb);
    // filter suburbs and get unique subarbs
    let uniqueSubarbs: string[] = [...new Set(suburbs)];

    return of(uniqueSubarbs);
  }

  // Pushes searched stands into _stands BehaviourSubject
  searchStandsFromSurbab(surbab: string): void {
    // change to using a pipe to filter stands
    let filteredStands = fakeStands.filter((stand) =>
      stand.suburb.includes(surbab)
    );
    this._stands.next(filteredStands);
  }

  sortStands(sortType: String): void {
    if (sortType === 'price') {
      this.stands$ = this.stands$.pipe(
        map((stands) =>
          stands.sort((stand1, stand2) =>
            stand1.price < stand2.price ? -1 : 1
          )
        )
      );
    } else if (sortType === 'size') {
      this.stands$ = this._stands.pipe(
        map((stands) =>
          stands.sort((stand1, stand2) =>
            stand1.price < stand2.price ? -1 : 1
          )
        )
      );
    }
  }

  communityFilterChanged(value: Community) {
    // Everytime we have new value, we pass it to the filter$
    this.stands$ = this._stands.pipe(
      map((stands) =>
        stands.filter((stand) =>
          stand.community.match(this._communityFilters.value)
        )
      )
    );

    this.stands$.subscribe({
      next: (stands) => console.log(stands),
    });
  }

  // handle requests for sold land
  filterIsSold(status: boolean) {
    this._isSoldFilters.next(status);

    this.stands$ = this._stands.pipe(
      map((stands) => stands.filter((stand) => stand.isSold == status))
    );
  }

  // filter from type of stands
  standTypeFilterChange(value: StandType) {
    this._standTypeFilters.next(value);

    this.stands$ = this._stands.pipe(
      map((stands) =>
        stands.filter((stand) =>
          stand.standType.match(this._standTypeFilters.value)
        )
      )
    );
  }

  resetFilter() {
    this.stands$ = this._stands;
  }

  getCities() {
    // filter array of objects and return surbubs
    let cities: string[] = fakeStands.map((stand) => stand.city);
    // filter suburbs and get unique subarbs
    let uniqueCity: string[] = [...new Set(cities)];

    return of(uniqueCity);
  }

  searchByCity(city: string) {
    let filteredStands = fakeStands.filter((stand) =>
      stand.city.includes(city)
    );
    this._stands.next(filteredStands);
  }

  searchByStandType(type: StandType) {
    let filteredStands = fakeStands.filter((stand) => stand.standType === type);
    this._stands.next(filteredStands);
  }

  searchCommunity(type: Community) {
    let filteredStands = fakeStands.filter((stand) => stand.community === type);
    this._stands.next(filteredStands);
  }
}
