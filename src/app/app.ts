import { Component, ElementRef, signal, ViewChild } from '@angular/core';
// import { RouterOutlet } from '@angular/router'
import { FormsModule } from '@angular/forms';
import { Service } from './util/services/service';
import { Receitas } from './util/interfaces/receita.model';
import { Mensagens } from './util/interfaces/mensagens.model';
import { CommonModule } from '@angular/common';
import { Gastos } from './util/interfaces/gastos.model';
import { ProgressBarComponent } from "./util/componentes/progress-bar/progress-bar";
import { StepperComponent } from "./util/componentes/stepper/stepper";
import { Passo } from './util/interfaces/passo.model';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, ProgressBarComponent, StepperComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})


export class App {
  protected readonly title = signal('controle-financeiro');

  @ViewChild('chatBox') private chatBox!: ElementRef;
  private shouldScroll = false;

  progresso = 0;

  digitarMensagem: string = '';
  receita: Receitas[] = [];
  gastos: Gastos[] = [];
  msg: Mensagens[] = [];

  passos: Passo[] = [
  {
    desc: 'Receitas',
    numero: 1,
    ativo: true,
    executado: false
  },
  {
    desc: 'Gastos',
    numero: 2,
    ativo: false,
    executado: false
  },
  {
    desc: 'Análise',
    numero: 3,
    ativo: false,
    executado: false
  }
];

  constructor(private service: Service) { }

  ngOnInit() {
    this.init('Olá! Nós somos seu assistente financeiro, envie primeiro suas receitas no modelo palavra-valor:');
    this.init('salario 2500 investimento 500 aluguel');
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }


  enviarInfos() {
    debugger
    let infoUsuario = this.digitarMensagem;
    if (infoUsuario !== '' || this.msg.length > 0) {
      this.pegarValores(infoUsuario, 'receita');

      this.msg.push({
        texto: infoUsuario,
        usuario: 'usuario'
      })

      //limpando campo
      this.digitarMensagem = '';
      infoUsuario = ''

      this.receberGastos();

      this.avancarEtapa();

    } else if (infoUsuario === '') {
      this.service.emitirMensagem('Erro', 'Digite seus gastos para que seja feito o cálculo!', 'warning')
    }

    else {
      this.receberGastos();
      this.pegarValores(infoUsuario, 'gasto')

      //limpando campo
      this.digitarMensagem = '';
      infoUsuario = ''

      this.avancarEtapa();

    }
  }

  receberGastos() {
    this.respostaBot('Agora envie seus gastos no mesmo modelo!')

    // this.scrollToBottom()
  }

  respostaBot(texto: string) {
    setTimeout(() => {
      this.msg.push({
        texto,
        usuario: 'bot'
      });

      // this.scrollToBottom();
    }, 1000);
  }

  init(texto: string) {
    this.msg.push({
      texto,
      usuario: 'bot'
    });
  }

  scrollToBottom() {
    const el = this.chatBox.nativeElement;
    el.scrollTop = el.scrollHeight;
  }


  pegarValores(texto: string, tipo: 'receita' | 'gasto') {
    //word, space, valor
    const regex = /(\w+)\s+(\d+(?:,\d{2})?)/gi;
    let match;
    if (tipo == 'receita') {
      while ((match = regex.exec(texto)) !== null) {
        const descricao = match[1].toLowerCase();
        const valor = parseFloat(match[2].replace(",", "."));
        this.receita.push({ descricao, valor });
      }
    } else {
      while ((match = regex.exec(texto)) !== null) {
        const descricao = match[1].toLowerCase();
        const valor = parseFloat(match[2].replace(",", "."));
        this.gastos.push({ descricao, valor });
      }
    }
  }

  avancarEtapa() {
  var etapaAtual = this.passos.findIndex(s => s.ativo);

  if (etapaAtual === -1) return;
  // marca como concluida
  this.passos[etapaAtual].executado = true;
  this.passos[etapaAtual].ativo = false;
  // ativa a próxima etapa 
  if (this.passos[etapaAtual + 1]) {
    this.passos[etapaAtual + 1].ativo = true;
  }

  var concluidos = this.passos.filter(s => s.executado).length;
  this.progresso = (concluidos / this.passos.length) * 100;
}
}
