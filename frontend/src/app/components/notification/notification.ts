import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

/**
 * Component encarregat de mostrar les notificacions emergents tipus toast (èxit o error) a l'usuari.
 * Es col·loca de manera fixa a la part superior dreta de la pantalla.
 */
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <div *ngFor="let n of service.notifications()" 
           [ngClass]="{
             'bg-green-50 border-green-200 text-green-800': n.type === 'success',
             'bg-red-50 border-red-200 text-red-800': n.type === 'error'
           }"
           class="flex items-center gap-3 py-2 px-4 border rounded-lg shadow-xl pointer-events-auto min-w-[450px] max-w-[600px] animate-slide-in">
        
        <span class="material-symbols-outlined" 
              [ngClass]="{
                'text-green-600': n.type === 'success',
                'text-red-600': n.type === 'error'
              }">
          {{ n.type === 'success' ? 'check_circle' : 'error' }}
        </span>

        <p class="text-sm font-medium flex-1">{{ n.message }}</p>

        <button (click)="service.remove(n.id)" class="text-on-surface-variant hover:text-on-surface transition-colors">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  `]
})
export class NotificationComponent {
  // Injecció directa del servei reactiu global de notificacions
  public service = inject(NotificationService);
}
