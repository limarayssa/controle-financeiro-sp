import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { Passo } from '../../interfaces/passo.model';
@Component({
  selector: 'app-stepper',
  imports: [ButtonModule, StepperModule],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class StepperComponent {

  @Input() passos: Passo[] = [];
  @Output() novoPasso = new EventEmitter<number>();

  passoAtual = 0;

  proximoPasso() {
    if (this.passoAtual < this.passos.length) {
      this.passos[this.passoAtual].executado = true;
      this.passoAtual++;
      this.novoPasso.emit(this.passoAtual);
    }
  }

}
