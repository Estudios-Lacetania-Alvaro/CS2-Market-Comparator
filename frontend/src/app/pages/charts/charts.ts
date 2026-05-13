import { Component, OnInit, signal, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import Chart from 'chart.js/auto';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './charts.html',
  styleUrls: ['./charts.css']
})
export class Charts implements OnInit {
  private statsService = inject(StatsService);

  summary = signal<any>(null);
  period = signal<string>('month');
  loading = signal<boolean>(true);

  @ViewChild('profitChart') profitChartCanvas!: ElementRef;
  chart: any;
  profitData: any[] = [];

  ngOnInit() {
    this.fetchSummary();
  }

  ngAfterViewInit() {
    this.fetchProfitData();
  }

  fetchSummary() {
    this.statsService.getActivitySummary().subscribe({
      next: (res) => this.summary.set(res),
      error: (err) => console.error(err)
    });
  }

  setPeriod(p: string) {
    this.period.set(p);
    this.fetchProfitData();
  }

  fetchProfitData() {
    this.loading.set(true);
    this.statsService.getRealizedProfit(this.period()).subscribe({
      next: (res) => {
        this.profitData = res.data_points;
        if (this.profitChartCanvas) {
          this.initProfitChart(this.profitData);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  initProfitChart(data: any[]) {
    if (!this.profitChartCanvas) return;
    const ctx = this.profitChartCanvas.nativeElement.getContext('2d');

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.day),
        datasets: [{
          label: 'Daily Profit (USD)',
          data: data.map(d => parseFloat(d.total_profit)),
          backgroundColor: data.map(d => parseFloat(d.total_profit) >= 0 ? '#10b981' : '#ef4444'),
          borderRadius: 4,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.parsed.y;
                return val !== null ? `$${val.toFixed(2)}` : '$0.00';
              }
            }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { family: 'JetBrains Mono' } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'JetBrains Mono' } }
          }
        }
      }
    });
  }
}
