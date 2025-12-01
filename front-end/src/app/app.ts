import { ApplicationRef, ChangeDetectorRef, Component, ElementRef, NgZone, signal, ViewChild } from '@angular/core';
// import { RouterOutlet } from '@angular/router'
import { FormsModule } from '@angular/forms';
import { Service } from './util/services/service';
import { Receitas } from './util/interfaces/receita.model';
import { Mensagens } from './util/interfaces/mensagens.model';
import { CommonModule } from '@angular/common';
import { Gastos } from './util/interfaces/gastos.model';
import { StepperComponent } from "./util/componentes/stepper/stepper";
import { Passo } from './util/interfaces/passo.model';
import { Infos } from './util/interfaces/infos.model';
import { Clipboard } from "@angular/cdk/clipboard";

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, StepperComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('controle-financeiro');

  @ViewChild('chatBox') private chatBox!: ElementRef;



  progresso = 0;

  digitarMensagem: string = '';
  receita: Receitas[] = [];
  gastos: Gastos[] = [];
  msg: Mensagens[] = [];
  infos: Infos[] = [];

  resultado: string = '';


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
      desc: 'Análise',
      numero: 3,
      ativo: false,
      executado: false,
    }
  ];

  constructor(private service: Service, private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private appRef: ApplicationRef,
    private clip: Clipboard
  ) { }

  ngOnInit() {
    this.init(
      'Olá! Nós somos seu assistente financeiro, envie primeiro suas receitas no modelo palavra-valor, uma por linha, como no exemplo abaixo:'
    );
    this.init('salario 2500');
    this.init("Ao terminar, envie um ponto '.' para proceder");
  }

  ngAfterViewInit() {
    this.scrollToBottom();
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
      if (infoUsuario === '.' && this.receita.length > 0) {
        this.respostaBot('Receitas registradas! Agora envie seus gastos no mesmo modelo:');
        this.respostaBot("Ao terminar, envie um ponto '.' novamente para finalizar");
        this.avancarEtapa();
      } else {
        this.pegarValores(infoUsuario, 'receita');
      }
    } else if (etapaAtual === 1) {
      // Gastos
      if (infoUsuario === '.' && this.gastos.length > 0) {
        this.respostaBot('Entendido, gerando o resumo!');
        this.avancarEtapa();

        debugger
        const infoFinanceira = {
          receita: this.receita,
          gasto: this.gastos,
        };

        this.service.emitirResumo(infoFinanceira).subscribe({
          next: (res) => {

            this.zone.run(() => {

              this.resultado = res.resposta.replace(/\n/g, '<br>')
              this.cdr.detectChanges();
              console.log(this.resultado);
              this.cdr.markForCheck();
            });
          },
          error: (err) => {
            console.error('Erro na API:', err);
          }
        });
      } else {
        this.pegarValores(infoUsuario, 'gasto');
      }


    }

    // Limpa campo
    this.digitarMensagem = '';
  }

  scrollToBottom = () => {
    setTimeout(() => {
      if (this.chatBox?.nativeElement) {
        try {
          this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
        } catch (err) {
          console.log('Erro scroll' + err)
        }
      }
    }, 100);

  }

  respostaBot(texto: string) {
    setTimeout(() => {
      this.zone.run(() => {
        this.msg.push({ texto, usuario: 'bot' });
        this.cdr.markForCheck();
        this.appRef.tick();  // força ciclo de detecção global
        this.scrollToBottom();
      });
    }, 500);
  }

  init(texto: string) {
    this.msg.push({
      texto,
      usuario: 'bot',
    });
  }


  pegarValores(texto: string, tipo: 'receita' | 'gasto' | 'meta') {
    //word, space, valor positivo com virgula ou ponto
    const regex = /^(\w+)\s+(\d+(?:[.,]\d{1,2})?)$/i;

    this.scrollToBottom();

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
    // verificação de múltiplas palavras
    if (/\s/.test(descricao)) {
      this.respostaBot('A descrição deve ser apenas uma palavra!');
      return;
    }

    if (tipo === 'receita') {
      this.receita.push({ descricao, valor });
    } else if (tipo === 'gasto') {
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

  divisaoValores() {
    const totalReceita = this.receita.reduce((acc, r) => acc + r.valor, 0);

    const setenta = totalReceita * 0.7;
    const vinte = totalReceita * 0.2;
    const dez = totalReceita * 0.1;

    this.infos.push({
      titulo: 'Divisão 70/20/10',
      texto: `Essenciais: R$ ${setenta.toFixed(2)} | Investimentos: R$ ${vinte.toFixed(2)} | Lazer: R$ ${dez.toFixed(2)}`
    });
  }

  gastosFixos() {
    if (this.gastos.length === 0) {
      this.infos.push({ titulo: 'Gastos fixos', texto: 'Nenhum gasto informado.' });
      return;
    }

    const listaGastos = this.gastos.map(gastos => `${gastos.descricao}: R$ ${gastos.valor.toFixed(2)}`).join(', ');
    this.infos.push({ titulo: 'Gastos fixos', texto: listaGastos });
  }

  valorInvestir() {
    const totalReceita = this.receita.reduce((acc, r) => acc + r.valor, 0);
    const totalGastos = this.gastos.reduce((acc, g) => acc + g.valor, 0);
    const sobra = totalReceita - totalGastos;

    this.infos.push({
      titulo: 'Quanto posso investir?',
      texto: `Receita: R$ ${totalReceita.toFixed(2)} | Gastos: R$ ${totalGastos.toFixed(2)} | Dinheiro disponível: R$ ${sobra.toFixed(2)}`
    });
  }

  copiarTexto(texto: string) {
    var correcao = texto.replace(/<br>/g, ' ')
    this.clip.copy(correcao);
  }
}
