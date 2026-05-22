import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex-grow w-full max-w-[1440px] mx-auto p-lg flex flex-col justify-center items-center mt-sm min-h-[70vh] gap-md text-center font-data-mono">
      <h1 class="text-[120px] font-bold text-[#ef4444] leading-none">404</h1>
      <p class="text-xl text-on-surface uppercase tracking-widest border-b border-[#ef4444] pb-2">Target not found</p>
      
      <!-- GIF de CSGO sol·licitat per l'usuari -->
      <img src="/csgo.gif" alt="404 Not Found" class="w-240 h-240 object-cover my-6 shadow-2xl border-4 border-outline-variant rounded" />
      
      <p class="text-sm text-on-surface-variant mb-6 max-w-md uppercase">
        The sector you are trying to access does not exist or has been wiped from the global database.
      </p>
      
      <a routerLink="/home" class="bg-primary text-on-primary font-bold uppercase tracking-widest px-8 py-3 hover:bg-[#16a34a] transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-none">
        Return to Base
      </a>
    </div>
  `
})
export class NotFound {}
