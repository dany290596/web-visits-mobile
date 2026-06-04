import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../../environments/environment';

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface EmailTemplateResponse {
  id: string;
  templateHtml: string;
  updatedAt: string | null;
}

export interface ApiResponse<T> {
  respuesta: boolean;
  mensaje: string;
  codigo: number;
  data: T;
}

// ── Servicio ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class EmailTemplateService {
  private readonly http = inject(HttpClient);

  /**
   * Obtiene la plantilla HTML cruda (con placeholders) desde la API.
   * GET /api/EmailTemplate/{companyId}
   */
  getTemplate(companyId: string): Observable<EmailTemplateResponse> {
    return this.http
      .get<ApiResponse<EmailTemplateResponse>>(
        `${environment.api}EmailTemplate/${companyId}`
      )
      .pipe(map(r => r.data));
  }

  /**
   * Abre el preview renderizado en una nueva pestaña.
   * Llama a GET /api/EmailTemplate/{companyId}/preview (devuelve HTML plano).
   *
   * Patrón: fetch → blob → createObjectURL → window.open
   * Esto evita problemas de CORS con popups que usan document.write.
   */
  openPreviewTab(companyId: string): void {
    const url = `${environment.api}EmailTemplate/${companyId}/Preview`;

    fetch(url, {
      headers: { 'Content-Type': 'text/html' }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Preview no disponible (${res.status})`);
        return res.blob();
      })
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        const win = window.open(objectUrl, '_blank');
        if (!win) {
          // Fallback si el navegador bloqueó el popup
          const a = document.createElement('a');
          a.href = objectUrl;
          a.target = '_blank';
          a.click();
        }
        // Libera memoria después de 60 s
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      })
      .catch(err => console.error('[EmailTemplateApiService] openPreviewTab:', err));
  }

  /**
   * Persiste la plantilla HTML en base de datos.
   * POST /api/EmailTemplate/{companyId}
   * Header requerido: Usuario = usuarioId (GUID)
   */
  saveTemplate(
    companyId: string,
    usuarioId: string,
    templateHtml: string
  ): Observable<ApiResponse<null>> {
    const headers = new HttpHeaders({ Usuario: usuarioId });

    return this.http.post<ApiResponse<null>>(
      `${environment.api}EmailTemplate/${companyId}`,
      { templateHtml },
      { headers }
    );
  }

  // ── 4. Construye el HTML completo a partir de los valores del form ───────
  // Este método es el PUENTE entre el formulario Angular y el POST a BD.
  // Recibe los valores del form y devuelve un string HTML con placeholders.
  buildTemplateHtml(config: {
    asunto: string;
    nombreRemitente: string;
    emailRemitente: string;
    telefonoContacto: string;
    emailContacto: string;
    direccion: string;
    tituloPaso1: string;
    textoPaso1: string;
    tituloPaso2: string;
    textoPaso2: string;
    tituloPaso3: string;
    textoPaso3: string;
    nombreEmpresa: string;
  }): string {
    const year = new Date().getFullYear();

    // Los placeholders {{...}} serán reemplazados por el Servicio Windows en producción.
    // En el endpoint /Preview los reemplaza el backend con datos de muestra estáticos.
    return /* html */`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.asunto}</title>
  <style>
    /* ── Reset básico compatible con clientes de correo ── */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; }
    body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: Arial, sans-serif; }

    /* ── Layout ── */
    .email-outer  { width: 100%; background-color: #f4f6f9; padding: 32px 0; }
    .email-inner  { max-width: 600px; margin: 0 auto; background: #ffffff;
                    border-radius: 8px; overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,.08); }

    /* ── Header ── */
    .email-header { 
      background: #002366;
      text-align: center;
      padding: 14px;
    }
    .email-logo   { 
      display: inline-block;
      background: white;
      border-radius: 4px;
      padding: 3px 12px;
      font-size: 11px;
      font-weight: 700;
      color: #002366;
    }

    /* ── Body ── */
    .email-body   { 
      padding: 16px 18px;

      h2 {
          font-size: 13px;
          color: #002366;
          margin: 0 0 6px;

          em {
              font-style: normal;
              color: #FF6F00;
          }
      }

      p {
          font-size: 11px;
          color: #444;
          line-height: 1.5;
          margin: 0 0 6px;
      }
    }

    /* ── Secciones / pasos ── */
    .ewt-email-section {
      margin: 10px 0;
      padding: 9px 11px;
      background: #FFF4E6;
      border-left: 4px solid #FF6F00;

      h3 {
        font-size: 11px;
        font-weight: 700;
        color: #002366;
        margin: 0 0 4px;
      }

      p {
          font-size: 11px;
          color: #555;
          margin: 0;
      }
    };
    .step-block   { margin: 24px 0; padding: 20px 24px;
                    border-left: 4px solid #0d6efd; background: #f8faff;
                    border-radius: 0 6px 6px 0; }
    .step-block h3 { margin: 0 0 8px; font-size: 16px; color: #1a3a5c; }
    .step-block p  { margin: 0; font-size: 14px; color: #555; }

    /* ── Botones tiendas ── */
    .store-row    { margin-top: 14px; }
    .store-btn    { display: inline-block; margin-right: 10px; padding: 8px 18px;
                    background: #1a3a5c; color: #ffffff; border-radius: 20px;
                    font-size: 13px; text-decoration: none; }

    /* ── QR ── */
    .qr-wrapper   { text-align: center; margin: 16px 0; }
    .qr-wrapper img { width: 130px; height: 130px; }
    .qr-caption   { text-align: center; font-size: 13px; color: #888; margin-top: 6px; }

    /* ── Código de invitación ── */
    .invite-code  { text-align: center; font-size: 28px; font-weight: 700;
                    letter-spacing: 4px; color: #002366;
                    background: #eef4ff; border: 2px dashed #002366;
                    border-radius: 8px; padding: 16px; margin: 16px 0; }

    /* ── Contacto ── */
    .contact-box  { 
      background: #F8F9FF;
      padding: 9px;
      border: 2px solid #002366;
      border-radius: 4px;
      margin: 10px 0;
      font-size: 10px;
      color: #002366;
      line-height: 1.8;
      text-align: center;
    }

    /* ── Footer ── */
    .email-footer { 
      background: #002366;
      color: white;
      padding: 10px;
      text-align: center;
      font-size: 9px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="email-outer">
    <div class="email-inner">

      <!-- Encabezado -->
      <div class="email-header">
        <div class="email-logo">${config.nombreEmpresa}</div>
      </div>

      <!-- Cuerpo -->
      <div class="email-body">
        <h2>Estimado(a): <em>{{destinatario}}</em>,</h2>
        <p>Gracias por utilizar nuestros servicios. Aquí están los detalles de su acceso:</p>

        <!-- Paso 1 -->
        <div class="ewt-email-section">
          <h3>Paso 1. ${config.tituloPaso1}</h3>
          <p>${config.textoPaso1}</p>
          <div class="store-row">
            <a href="#" class="store-btn">&#9654; Google Play</a>
            <a href="#" class="store-btn">&#9654; App Store</a>
          </div>
        </div>

        <!-- Paso 2 -->
        <div class="ewt-email-section">
          <h3>Paso 2. ${config.tituloPaso2}</h3>
          <p>${config.textoPaso2}</p>
          <div class="qr-wrapper">
            <img src="data:image/svg+xml;base64,{{qrBase64}}" alt="Código QR de acceso" />
          </div>
          <p class="qr-caption">Escanea este código QR para validar tu acceso.</p>
        </div>

        <!-- Paso 3 -->
        <div class="ewt-email-section">
          <h3>Paso 3. ${config.tituloPaso3}</h3>
          <p>${config.textoPaso3}</p>
          <div class="invite-code">{{codigoInvitacion}}</div>
          <p style="font-size:13px;color:#888;text-align:center;">
            Válido hasta: {{fechaExpiracion}}
          </p>
        </div>

        <!-- Datos de contacto -->
        <div class="contact-box">
          &#128222; <strong>Tel:</strong> ${config.telefonoContacto}<br/>
          &#128231; <strong>Email:</strong> ${config.emailContacto}<br/>
          &#128205; <strong>Dirección:</strong> ${config.direccion}
        </div>
      </div>

      <!-- Pie -->
      <div class="email-footer">
        &copy; ${year} ${config.nombreEmpresa}. Todos los derechos reservados.<br/>
        Este es un mensaje automático, por favor no responda a este correo.
      </div>

    </div>
  </div>
</body>
</html>`;
  }
}