import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CricketService {
  private readonly apiKey = 'd833c819-72f9-4c15-a4bc-435fbd8eaa29';
  private readonly baseUrl = 'https://api.cricapi.com/v1';

  private readonly roanuzProjectKey = 'RS_P_2038592323172044846';
  private readonly roanuzApiKey = 'RS5:2c4856bde829e95db25e8c4c1d34ac50';
  private roanuzAccessToken: string | null = "v5sRS_P_2038592323172044846s2038965072755322256";

  constructor(private http: HttpClient) { }

  getRoanuzToken(): Observable<any> {
    const url = `https://corsproxy.io/?https://api.sports.roanuz.com/v5/core/${this.roanuzProjectKey}/auth/`;
    const payload = { api_key: this.roanuzApiKey };

    return this.http.post(url, payload).pipe(
      tap((response: any) => {
        if (response && response.data && response.data.token) {
          this.roanuzAccessToken = response.data.token;
          console.log('Roanuz Auth Success');
        }
      }),
      catchError(err => {
        console.error('Error authenticating with Roanuz', err);
        return of({ error: true });
      })
    );
  }

  getCurrentMatches(): Observable<any> {
    const url = `${this.baseUrl}/currentMatches?apikey=${this.apiKey}&offset=0`;
    return this.http.get(url).pipe(
      catchError(err => {
        console.error('Error fetching current matches', err);
        return of({ error: true, data: [] });
      })
    );
  }

  getMatchScorecard(matchId: string): Observable<any> {
    const url = `${this.baseUrl}/match_scorecard?apikey=${this.apiKey}&offset=0&id=${matchId}`;
    return this.http.get(url).pipe(
      catchError(err => {
        console.error(`Error fetching scorecard for ${matchId}`, err);
        return of({ error: true });
      })
    );
  }

  getRoanuzFeaturedMatches(): Observable<any> {
    const url = `https://corsproxy.io/?https://api.sports.roanuz.com/v5/cricket/${this.roanuzProjectKey}/featured-matches-2/`;
    const headers = { 'rs-token': this.roanuzAccessToken || '' };

    return this.http.get(url, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching Roanuz featured matches', err);
        return of({ error: true });
      })
    );
  }

  getRoanuzMatchDetails(matchKey: string): Observable<any> {
    const url = `https://corsproxy.io/?https://api.sports.roanuz.com/v5/cricket/${this.roanuzProjectKey}/match/${matchKey}/`;
    const headers = { 'rs-token': this.roanuzAccessToken || '' };

    return this.http.get(url, { headers }).pipe(
      catchError(err => {
        console.error(`Error fetching Roanuz match details for ${matchKey}`, err);
        return of({ error: true });
      })
    );
  }

  getRoanuzOverSummary(matchKey: string): Observable<any> {
    const url = `https://corsproxy.io/?https://api.sports.roanuz.com/v5/cricket/${this.roanuzProjectKey}/match/${matchKey}/over-summary/`;
    const headers = { 'rs-token': this.roanuzAccessToken || '' };

    return this.http.get(url, { headers }).pipe(
      catchError(err => {
        console.error(`Error fetching Over Summary for ${matchKey}`, err);
        return of({ error: true });
      })
    );
  }

  getRoanuzBallByBall(matchKey: string, overKey?: string): Observable<any> {
    const suffix = overKey ? `${overKey}/` : '';
    const url = `https://corsproxy.io/?https://api.sports.roanuz.com/v5/cricket/${this.roanuzProjectKey}/match/${matchKey}/ball-by-ball/${suffix}`;
    const headers = { 'rs-token': this.roanuzAccessToken || '' };

    return this.http.get(url, { headers }).pipe(
      catchError(err => {
        console.error(`Error fetching Ball-by-Ball for ${matchKey}`, err);
        return of({ error: true });
      })
    );
  }


}
