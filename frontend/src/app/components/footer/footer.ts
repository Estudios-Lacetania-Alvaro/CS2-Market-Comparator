import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Component del peu de pàgina de l'aplicació.
 * Mostra la informació de copyright i els autors del projecte.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
})
export class Footer {}
