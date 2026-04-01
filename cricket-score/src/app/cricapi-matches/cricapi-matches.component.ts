import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CricketService } from '../cricket.service';

@Component({
  selector: 'app-cricapi-matches',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cricapi-matches.component.html',
  styleUrls: ['../app.scss'] // Sharing same premium styles
})
export class CricapiMatchesComponent implements OnInit {
  private cricketService = inject(CricketService);
  
  protected readonly matches = signal<any[]>([]);
  protected readonly selectedMatchScorecard = signal<any>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit() {
    this.fetchCurrentMatches();
  }

  fetchCurrentMatches() {
    this.loading.set(true);
    this.error.set(null);

    this.cricketService.getCurrentMatches().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.matches.set(response.data);
        } else {
          this.error.set('No matches found or API limit reached.');
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to fetch current matches.');
        this.loading.set(false);
      }
    });
  }

  viewScorecard(matchId: string) {
    this.loading.set(true);
    this.error.set(null);
    this.selectedMatchScorecard.set(null);

    this.cricketService.getMatchScorecard(matchId).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.selectedMatchScorecard.set(response.data);
        } else {
          this.error.set('Scorecard not available for this match.');
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to fetch scorecard.');
        this.loading.set(false);
      }
    });
  }

  closeScorecard() {
    this.selectedMatchScorecard.set(null);
  }
}
