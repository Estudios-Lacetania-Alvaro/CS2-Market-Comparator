import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsapiService } from '../../services/csapi.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private csapiService = inject(CsapiService);

  rankings = signal<any[]>([]);
  matches = signal<any[]>([]);
  players = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    
    // Fetch rankings
    this.csapiService.getRankings().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res.rankings || []);
        this.rankings.set(data.slice(0, 10)); // 10 equipos
      },
      error: (err) => console.error('Error loading rankings', err)
    });

    // Fetch players
    this.csapiService.getPlayerStats().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res.players || []);
        this.players.set(data.slice(0, 10)); // 10 jugadores
      },
      error: (err) => console.error('Error loading players', err)
    });

    // Fetch matches
    this.csapiService.getLatestMatches().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : (res.matches || []);
        this.matches.set(data.slice(0, 3)); // 3 partidos
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading matches', err);
        this.loading.set(false);
      }
    });
  }
}
