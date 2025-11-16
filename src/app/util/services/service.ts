import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Service {

  emitirMensagem(titulo: string, texto: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question') {
    return Swal.fire({
      title: titulo,
      text: texto,
      icon: icon,
      customClass: {
        popup: 'pop-up'
      }
    })
  }

}
