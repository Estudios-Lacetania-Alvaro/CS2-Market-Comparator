import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService } from '../../services/ai.service';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    @if (shouldShow()) {
      <div class="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-md font-data-mono pointer-events-none">
        
        <!-- Chat Window -->
        <div 
          [class.translate-y-0]="isOpen()"
          [class.opacity-100]="isOpen()"
          [class.pointer-events-auto]="isOpen()"
          [class.translate-y-10]="!isOpen()"
          [class.opacity-0]="!isOpen()"
          [class.pointer-events-none]="!isOpen()"
          [class.w-[450px]]="!isExpanded()"
          [class.h-[650px]]="!isExpanded()"
          [class.w-[80vw]]="isExpanded()"
          [class.h-[80vh]]="isExpanded()"
          class="bg-white border-2 border-[#1e293b] shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] flex flex-col overflow-hidden transition-all duration-300 ease-out">
          
          <!-- Header -->
          <div class="bg-[#1e293b] p-md flex justify-between items-center">
            <div class="flex items-center gap-xs">
              <span class="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
              <span class="text-sm font-bold text-white uppercase tracking-widest">Market_Analyst_AI v1.0.4</span>
            </div>
            <div class="flex items-center gap-sm">
              <button (click)="toggleExpand()" class="text-white hover:text-[#22c55e] transition-colors" [title]="isExpanded() ? 'Reducir' : 'Ampliar'">
                <span class="material-symbols-outlined text-[24px]">
                  {{ isExpanded() ? 'close_fullscreen' : 'open_in_full' }}
                </span>
              </button>
              <button (click)="toggleChat()" class="text-white hover:text-[#22c55e] transition-colors" title="Cerrar">
                <span class="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-grow overflow-y-auto p-md space-y-lg bg-[#f8fafc]">
            
            <!-- AI Welcome Message -->
            <div class="space-y-xs">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-tighter">AI_CORE > SYSTEM_STATUS: READY</p>
              <div class="bg-[#e8f2e1] border border-[#1e293b] p-md text-sm leading-relaxed">
                Hello operator. Analyzing your current market position... 
                Click the refresh button below to synchronize with your inventory.
              </div>
            </div>

            @if (loading()) {
              <div class="bg-[#e8f2e1] border border-[#1e293b]">
                <app-loading-spinner />
              </div>
            }

            @if (analysis()) {
              <!-- General Analysis -->
              <div class="space-y-xs">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-tighter">GLOBAL_REPORT</p>
                <div class="bg-white border border-[#1e293b] p-md text-sm leading-relaxed italic border-l-4 border-l-[#22c55e]">
                  "{{ analysis().general_analysis }}"
                </div>
              </div>

              <!-- Recommendations List -->
              <div class="space-y-md">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-tighter">TARGET_OPERATIONS ({{ analysis().recommendations.length }})</p>
                
                @for (rec of analysis().recommendations; track rec.inventory_id) {
                  <div class="bg-white border border-[#1e293b] p-md space-y-sm">
                    <div class="flex justify-between items-start">
                      <span class="text-sm font-bold truncate pr-md">{{ rec.skin_name }}</span>
                      <span [class]="rec.action === 'sell' ? 'bg-[#22c55e] text-white' : 'bg-[#1e293b] text-white'" 
                            class="px-2 py-0.5 text-xs font-bold uppercase">
                        {{ rec.action }}
                      </span>
                    </div>
                    <p class="text-sm text-slate-600 leading-tight">{{ rec.reason }}</p>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer / Controls -->
          <div class="p-md border-t border-slate-200 bg-white">
            <button 
              (click)="fetchAnalysis()"
              [disabled]="loading()"
              class="w-full bg-[#1e293b] text-white py-sm text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#22c55e] transition-colors disabled:opacity-50 flex items-center justify-center gap-xs">
              <span class="material-symbols-outlined text-[20px]">sync_alt</span>
              Request New Analysis
            </button>
          </div>
        </div>

        <!-- Toggle Button -->
        <button 
          (click)="toggleChat()"
          class="pointer-events-auto w-14 h-14 rounded-full bg-[#1e293b] border-2 border-[#1e293b] shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group">
          <span class="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">
            {{ isOpen() ? 'chat_bubble_outline' : 'smart_toy' }}
          </span>
        </button>
      </div>
    }
  `
})
export class AiAssistantComponent {
  private aiService = inject(AiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isOpen = signal(false);
  isExpanded = signal(false);
  loading = signal(false);
  analysis = signal<any>(null);
  currentUrl = signal(this.router.url);

  constructor() {
    this.router.events.subscribe(() => {
      this.currentUrl.set(this.router.url);
    });
  }

  shouldShow = computed(() => {
    const isLogged = !!this.authService.currentUser();
    const isNotHome = this.currentUrl() !== '/' && this.currentUrl() !== '/home';
    return isLogged && isNotHome;
  });

  toggleChat() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen() && !this.analysis()) {
      this.fetchAnalysis();
    }
  }

  toggleExpand() {
    this.isExpanded.set(!this.isExpanded());
  }

  fetchAnalysis() {
    this.loading.set(true);
    this.aiService.getRecommendations().subscribe({
      next: (data) => {
        this.analysis.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
