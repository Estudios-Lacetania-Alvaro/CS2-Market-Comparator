import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Component de la pantalla de càrrega.
 * Selecciona de forma aleatòria un GIF de càrrega de CS:GO per oferir una experiència de disseny completament immersiva i prèmium.
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-8 gap-sm">
      <img [src]="currentGif()" alt="[  ]" class="w-304 h-304 opacity-80 mix-blend-multiply" />
      <span class="text-lg font-bold text-[#22c55e] uppercase tracking-widest animate-pulse mt-4">
        Loading...
      </span>
    </div>
  `
})
export class LoadingSpinnerComponent implements OnInit {
  // Llista de GIFs de càrrega oficials/clàssics de CS:GO utilitzats per a la rotació aleatòria
  loadingGifs = [
    '/csgo_carga.gif',
    '/csgo_carga2.gif',
    '/csgo_carga3.gif',
    '/csgo_carga4.gif',
    '/csgo_carga5.gif'
  ];
  // Signal de la imatge de càrrega activa
  currentGif = signal(this.loadingGifs[0]);

  ngOnInit() {
    // Escollim de forma completament aleatòria un dels GIFs definits a la llista
    const randomIndex = Math.floor(Math.random() * this.loadingGifs.length);
    this.currentGif.set(this.loadingGifs[randomIndex]);
  }
}
