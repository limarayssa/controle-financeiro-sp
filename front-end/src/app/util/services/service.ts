import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Service {

  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:3000/api/finance';

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

    emitirResumo(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

}
