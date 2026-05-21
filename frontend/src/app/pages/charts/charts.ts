import { Component, OnInit, signal, inject, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { CurrencyService } from '../../services/currency.service';
import Chart from 'chart.js/auto';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';

/**
 * Component de la pàgina d'estadístiques i analítica de rendiment (ROI).
 * Integra gràfics complets interactius de Chart.js amb el convertidor reactiu de divises.
 */
@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './charts.html',
  styleUrls: ['./charts.css']
})
export class Charts implements OnInit {
  private statsService = inject(StatsService);
  public currencyService = inject(CurrencyService);

  // Senyal que conté el resum d'activitat (compres, vendes, operacions)
  summary = signal<any>(null);
  // Senyal del període actiu d'anàlisi (week, month, year, all)
  period = signal<string>('month');
  // Senyal d'estat de càrrega
  loading = signal<boolean>(true);

  // Referència del llenç HTML per dibuixar el gràfic de beneficis
  @ViewChild('profitChart') profitChartCanvas!: ElementRef;
  // Instància activa de Chart.js per a poder destruir-la i recrear-la correctament
  chart: any;
  // Memòria dels punts històrics de benefici obtinguts pel servei
  profitData: any[] = [];

  constructor() {
    // Efece reactiu: Es re-dibuixa el gràfic automàticament quan es canvia de moneda (USD/EUR)
    effect(() => {
      const currency = this.currencyService.selectedCurrency();
      if (this.profitData.length > 0 && this.profitChartCanvas) {
        this.initProfitChart(this.profitData);
      }
    });
  }

  ngOnInit() {
    // Carreguem el resum numèric d'operacions en inicialitzar
    this.fetchSummary();
  }

  ngAfterViewInit() {
    // Carreguem l'historial detallat de ROI una vegada el DOM i el canvas estan llestos
    this.fetchProfitData();
  }

  /**
   * Obté el resum general de l'activitat acumulada des del backend.
   */
  fetchSummary() {
    this.statsService.getActivitySummary().subscribe({
      next: (res) => this.summary.set(res),
      error: (err) => console.error(err)
    });
  }

  /**
   * Canvia el període d'anàlisi temporal actiu i recarrega l'historial.
   */
  setPeriod(p: string) {
    this.period.set(p);
    this.fetchProfitData();
  }

  /**
   * Obté les dades històriques de ROI segons el període de temps seleccionat.
   */
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

  /**
   * Inicialitza o actualitza el gràfic de barres de Chart.js.
   * Aplica color verd per a beneficis i vermell per a pèrdues de forma dinàmica,
   * així com tipografies monoespaiades (JetBrains Mono) i formats personalitzats de divisa.
   */
  initProfitChart(data: any[]) {
    if (!this.profitChartCanvas) return;
    const ctx = this.profitChartCanvas.nativeElement.getContext('2d');

    if (this.chart) {
      this.chart.destroy();
    }

    const symbol = this.currencyService.currencySymbol();
    const currencyName = this.currencyService.selectedCurrency();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.day),
        datasets: [{
          label: `Daily Profit (${currencyName})`,
          data: data.map(d => this.currencyService.convert(parseFloat(d.total_profit))),
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
                return val !== null ? `${symbol}${val.toFixed(2)}` : `${symbol}0.00`;
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
