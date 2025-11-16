import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css',
})
export class ProgressBarComponent {
    @Input('progresso') progress: string;
    @Input('disable-percentage') disabledP: boolean;


  constructor() {
    this.progress = '';
    this.disabledP = false;
  }

  progressoPorcentagem (progresso: string){
    try{
      return Math.round(+ progresso * 100) / 100;
    }
    catch{
      return progresso;
    }
  }

}
