import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css',
})
export class ProgressBarComponent {
    @Input('progresso') progress: number;
    @Input('disable-percentage') disabledP: boolean;


  constructor() {
    this.progress = 0;
    this.disabledP = false;
  }

  progressoPorcentagem (progresso: number){
    try{
      return Math.round(+ progresso * 100) / 100;
    }
    catch{
      return progresso;
    }
  }

}
