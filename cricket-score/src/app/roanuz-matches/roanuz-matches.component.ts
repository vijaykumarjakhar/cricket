import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common';
import { CricketService } from '../cricket.service';

@Component({
  selector: 'app-roanuz-matches',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, DecimalPipe],
  templateUrl: './roanuz-matches.component.html',
  styleUrls: ['../app.scss']
})
export class RoanuzMatchesComponent implements OnInit, OnDestroy {
  private cricketService = inject(CricketService);

  protected readonly matches = signal<any[]>([]);
  protected readonly selectedMatchDetail = signal<any>(null);
  protected readonly overSummary = signal<any>(null);
  protected readonly ballByBall = signal<any>(null);
  protected readonly liveMatchOdds = signal<any>(null);
  protected readonly players = signal<any>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly authenticated = signal(false);

  private pollingInterval: any;

  ngOnInit() { this.checkAuthAndFetch(); }

  ngOnDestroy() { this.stopPolling(); }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  checkAuthAndFetch() {
    this.loading.set(true);
    this.cricketService.getRoanuzToken().subscribe({
      next: (response: any) => {
        if (response?.data?.token) {
          this.authenticated.set(true);
          this.fetchFeaturedMatches();
        } else {
          this.error.set('Roanuz Authentication Failed.');
          this.loading.set(false);
        }
      },
      error: () => { this.error.set('Failed to connect to Roanuz Auth API.'); this.loading.set(false); }
    });
  }

  fetchFeaturedMatches() {
    this.loading.set(true);
    this.error.set(null);
    this.cricketService.getRoanuzFeaturedMatches().subscribe({
      next: (response: any) => {
        this.matches.set(response?.data?.matches || []);
        if (!response?.data?.matches?.length) this.error.set('No featured matches found.');
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to fetch featured matches.'); this.loading.set(false); }
    });
  }

  viewMatchDetail(matchKey: string) {
    this.loading.set(true);
    this.error.set(null);
    this.selectedMatchDetail.set(null);
    this.overSummary.set(null);
    this.ballByBall.set(null);
    this.liveMatchOdds.set(null);
    this.players.set(null);

    this.fetchMatchData(matchKey);

    // Setup 1-second polling as requested
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      this.fetchMatchData(matchKey, true);
    }, 1000);
  }

  fetchMatchData(matchKey: string, isPolling = false) {
    this.cricketService.getRoanuzMatchDetails(matchKey).subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.selectedMatchDetail.set(response.data);
          this.players.set(response.data.players || {});
          this.fetchExtraDetails(matchKey, isPolling);
        } else {
          if (!isPolling) {
            this.error.set('Match details not available.');
            this.loading.set(false);
          }
        }
      },
      error: () => { 
        if (!isPolling) {
          this.error.set('Failed to fetch match details.'); 
          this.loading.set(false); 
        }
      }
    });
  }

  fetchExtraDetails(matchKey: string, isPolling = false) {
    this.cricketService.getRoanuzOverSummary(matchKey).subscribe(res => {
      if (res?.data) this.overSummary.set(res.data);
    });
    this.cricketService.getRoanuzBallByBall(matchKey).subscribe(res => {
      if (res?.data) this.ballByBall.set(res.data);
      if (!isPolling) this.loading.set(false);
    });
  }

  closeDetail() {
    this.stopPolling();
    this.selectedMatchDetail.set(null);
    this.overSummary.set(null);
    this.ballByBall.set(null);
    this.liveMatchOdds.set(null);
    this.players.set(null);
  }

  // ─── HELPER METHODS ─────────────────────────────────────────────────────────

  getPlayerName(playerKey: string): string {
    const ps = this.players();
    return ps?.[playerKey]?.player?.name || playerKey || '—';
  }

  getInningsKeys(): string[] {
    const scores = this.selectedMatchDetail()?.scores;
    return scores ? Object.keys(scores) : [];
  }

  getInnings(key: string): any {
    return this.selectedMatchDetail()?.scores?.[key] || null;
  }

  getBattingScore(inningsKey: string, playerKey: string): any {
    return this.players()?.[playerKey]?.score?.[inningsKey] || null;
  }

  getBowlingScore(inningsKey: string, playerKey: string): any {
    return this.players()?.[playerKey]?.score?.[inningsKey] || null;
  }

  getTeamCode(teamKey: string): string {
    const detail = this.selectedMatchDetail();
    if (!detail?.teams) return teamKey?.toUpperCase() || '';
    for (const side of ['a', 'b']) {
      if (detail.teams[side]?.key === teamKey) return detail.teams[side]?.code || teamKey.toUpperCase();
    }
    return teamKey?.toUpperCase() || '';
  }

  isCurrentInnings(inningsKey: string): boolean {
    return this.selectedMatchDetail()?.live?.innings === inningsKey;
  }

  isActiveBowler(playerKey: string): boolean {
    return this.selectedMatchDetail()?.live?.recent_players?.bowler?.key === playerKey;
  }

  getBallsReversed(): any[] {
    const balls = this.ballByBall()?.over?.balls;
    return balls ? [...balls].reverse().slice(0, 12) : [];
  }

  formatOvers(overs: number[]): string {
    if (!overs) return '0.0';
    return `${overs[0]}.${overs[1]}`;
  }

  getTossText(): string {
    const t = this.selectedMatchDetail()?.toss;
    if (!t) return 'TBD';
    const name = this.getTeamCode(t.winner) || t.winner;
    return `${name} (${(t.decision || '').replace('_', ' ')}ing)`;
  }
}
