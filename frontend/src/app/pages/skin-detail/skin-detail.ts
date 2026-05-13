import { Component, OnInit, signal, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarketService } from '../../services/market.service';
import Chart from 'chart.js/auto';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-skin-detail',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule, LoadingSpinnerComponent],
  templateUrl: './skin-detail.html',
  styleUrls: ['./skin-detail.css']
})
export class SkinDetail implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private marketService = inject(MarketService);

  skin = signal<any>(null);
  loading = signal<boolean>(true);
  chart: any;

  private _chartCanvas!: ElementRef;
  @ViewChild('priceChart') set chartCanvas(content: ElementRef) {
    if (content) {
      this._chartCanvas = content;
      this.initChart();
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchDetail(+id);
    }
  }

  ngAfterViewInit() {}

  fetchDetail(id: number) {
    this.loading.set(true);
    this.marketService.getSkinDetail(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.skin.set(response.data);
          // initChart will be called by the @ViewChild setter
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  initChart() {
    if (!this._chartCanvas || !this.skin()?.historical_data) return;

    const ctx = this._chartCanvas.nativeElement.getContext('2d');
    const data = this.skin().historical_data;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((d: any) => d.timestamp),
        datasets: [
          {
            label: 'Steam Price',
            data: data.map((d: any) => d.steam_price),
            borderColor: '#4b91e2',
            backgroundColor: 'rgba(75, 145, 226, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#4b91e2',
            borderWidth: 2
          },
          {
            label: 'DMarket Price',
            data: data.map((d: any) => d.dmarket_price),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#22c55e',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // We use our custom legend in HTML
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0,0,0,0.05)',
              lineWidth: 0.5
            },
            ticks: {
              font: {
                family: "'JetBrains Mono', monospace",
                size: 10
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                family: "'JetBrains Mono', monospace",
                size: 9
              }
            }
          }
        }
      }
    });
  }
}
