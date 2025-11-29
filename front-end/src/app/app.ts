import { ApplicationRef, ChangeDetectorRef, Component, ElementRef, NgZone, signal, ViewChild } from '@angular/core';
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
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('controle-financeiro');



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
      executado: false,
    },
    {
      desc: 'Gastos',
      numero: 2,
      ativo: false,
      executado: false,
    },
    {
      desc: 'Metas',
      numero: 3,
      ativo: false,
      executado: false,
    },
    {
      desc: 'Análise',
      numero: 4,
      ativo: false,
      executado: false,
    },
  ];

  constructor(private service: Service,   private cdr: ChangeDetectorRef,
  private zone: NgZone,
  private appRef: ApplicationRef) { }

  ngOnInit() {
    this.init(
      'Olá! Nós somos seu assistente financeiro, envie primeiro suas receitas no modelo palavra-valor, uma por linha:'
    );
    this.init('salario 2500');
    this.init("Envie um ponto '.' quando terminar para proceder");
  }


  enviarInfos() {
    let infoUsuario = this.digitarMensagem.trim();

    if (!infoUsuario) return;

    this.msg.push({ texto: infoUsuario, usuario: 'usuario' });

    // verifica etapa atual
    const etapaAtual = this.passos.findIndex((s) => s.ativo);
    if (etapaAtual === -1) return;

    if (etapaAtual === 0) {
      // Receitas
      if (infoUsuario === '.') {
        this.respostaBot('Receitas registradas! Agora envie seus gastos no modelo palavra-valor:');
        this.avancarEtapa();
      } else {
        this.pegarValores(infoUsuario, 'receita');
      }
    } else if (etapaAtual === 1) {
      // Gastos
      if (infoUsuario === '.') {
        this.respostaBot('Gastos registrados! Vamos para a etapa de metas.');
        this.avancarEtapa();
      } else {
        this.pegarValores(infoUsuario, 'gasto');
      }
    } else if (etapaAtual === 2) {
        this.respostaBot('Entendido, gerando o resumo!!');
        this.avancarEtapa();
    }

    // Limpa campo
    this.digitarMensagem = '';
  }

  receberGastos() {
    this.respostaBot('Agora envie seus gastos no mesmo modelo!');

    // this.scrollToBottom()
  }

  respostaBot(texto: string) {
    setTimeout(() => {
    this.zone.run(() => {
      this.msg.push({ texto, usuario: 'bot' });
      this.cdr.markForCheck();
      this.appRef.tick();  // força ciclo de detecção global
    });
  }, 500);
  }

  init(texto: string) {
    this.msg.push({
      texto,
      usuario: 'bot',
    });
  }


  pegarValores(texto: string, tipo: 'receita' | 'gasto') {
    //word, space, valor positivo com virgula ou ponto
    const regex = /^(\w+)\s+(\d+(?:[.,]\d{1,2})?)$/i;

    const match = regex.exec(texto);
    if (!match) {
      this.respostaBot('Formato inválido! Use apenas uma palavra seguida de um valor positivo, ex: aluguel 1200');
      return;
    }

    const descricao = match[1].toLowerCase();
    const valor = parseFloat(match[2].replace(',', '.'));

    // Verificação de valor negativo
    if (valor < 0) {
      this.respostaBot('Valores negativos não são permitidos!');
      return;
    }
    // Verificação de múltiplas palavras (já garantida pelo regex, mas reforçamos)
    if (/\s/.test(descricao)) {
      this.respostaBot('A descrição deve ser apenas uma palavra!');
      return;
    }

    if (tipo === 'receita') {
      this.receita.push({ descricao, valor });
    } else {
      this.gastos.push({ descricao, valor });
    }
  }

  avancarEtapa() {
    var etapaAtual = this.passos.findIndex((s) => s.ativo);

    if (etapaAtual === -1) return;
    // marca como concluida
    this.passos[etapaAtual].executado = true;
    this.passos[etapaAtual].ativo = false;
    // ativa a próxima etapa
    if (this.passos[etapaAtual + 1]) {
      this.passos[etapaAtual + 1].ativo = true;
    }

    var concluidos = this.passos.filter((s) => s.executado).length;
    this.progresso = (concluidos / this.passos.length) * 100;
  }
}
