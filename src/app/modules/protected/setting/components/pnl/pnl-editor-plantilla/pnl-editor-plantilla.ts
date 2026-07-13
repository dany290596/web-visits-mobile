import { AfterViewInit, Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface VariablePlantilla {
  nombre: string;
  detalle?: string;
}

@Component({
  selector: 'app-pnl-editor-plantilla',
  imports: [CommonModule],
  templateUrl: './pnl-editor-plantilla.html',
  styleUrl: './pnl-editor-plantilla.css',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PnlEditorPlantilla),
    multi: true
  }]
})
export class PnlEditorPlantilla implements ControlValueAccessor, AfterViewInit {
  @Input() variables: VariablePlantilla[] = [];
  @Input() placeholder = 'Escribe el mensaje...';

  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  disabled = false;
  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };
  private savedRange: Range | null = null;
  private pendingValue = '';

  ngAfterViewInit(): void {
    this.renderContent(this.pendingValue);
  }

  // --- ControlValueAccessor ---
  writeValue(value: string): void {
    this.pendingValue = value ?? '';
    if (this.editorRef) this.renderContent(this.pendingValue);
  }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  // --- Texto plano -> HTML con tokens ---
  private renderContent(texto: string): void {
    const host = this.editorRef.nativeElement;
    host.innerHTML = '';
    if (!texto) return;

    const nombres = this.variables.map(v => v.nombre);
    for (const parte of this.tokenizar(texto, nombres)) {
      host.appendChild(parte.esVariable ? this.crearToken(parte.texto) : document.createTextNode(parte.texto));
    }
  }

  private tokenizar(texto: string, nombres: string[]): { texto: string; esVariable: boolean }[] {
    if (nombres.length === 0) return [{ texto, esVariable: false }];
    const patron = new RegExp('(' + nombres.map(n => n.replace(/[#.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
    const resultado: { texto: string; esVariable: boolean }[] = [];
    let ultimo = 0;
    let match: RegExpExecArray | null;
    while ((match = patron.exec(texto)) !== null) {
      if (match.index > ultimo) resultado.push({ texto: texto.slice(ultimo, match.index), esVariable: false });
      resultado.push({ texto: match[0], esVariable: true });
      ultimo = match.index + match[0].length;
    }
    if (ultimo < texto.length) resultado.push({ texto: texto.slice(ultimo), esVariable: false });
    return resultado;
  }

  private crearToken(nombre: string): HTMLElement {
    const span = document.createElement('span');
    span.textContent = nombre;
    span.setAttribute('contenteditable', 'false');
    span.setAttribute('data-variable', nombre);
    span.className = 'token-variable';
    return span;
  }

  // --- HTML -> texto plano (lo que se guarda de verdad) ---
  private serializar(): string {
    const host = this.editorRef.nativeElement;
    let resultado = '';
    host.childNodes.forEach(nodo => {
      if (nodo.nodeType === Node.TEXT_NODE) {
        resultado += nodo.textContent ?? '';
      } else if (nodo instanceof HTMLElement) {
        if (nodo.hasAttribute('data-variable')) resultado += nodo.getAttribute('data-variable');
        else if (nodo.tagName === 'BR') resultado += '\n';
        else resultado += nodo.textContent ?? '';
      }
    });
    return resultado;
  }

  onInput(): void {
    this.guardarCursor();
    this.onChange(this.serializar());
  }
  onBlur(): void { this.onTouched(); }
  onFocusOrKeyup(): void { this.guardarCursor(); }

  private guardarCursor(): void {
    const seleccion = window.getSelection();
    if (seleccion && seleccion.rangeCount > 0) {
      const rango = seleccion.getRangeAt(0);
      if (this.editorRef.nativeElement.contains(rango.startContainer)) {
        this.savedRange = rango.cloneRange();
      }
    }
  }

  // --- Inserción por click (invocado desde el padre vía @ViewChild) ---
  insertarVariable(nombre: string): void {
    const host = this.editorRef.nativeElement;
    host.focus();
    const rango = this.savedRange && host.contains(this.savedRange.startContainer)
      ? this.savedRange
      : this.crearRangoAlFinal();
    this.insertarTokenEnRango(nombre, rango);
  }

  // --- Drag & drop ---
  onDragOver(evento: DragEvent): void {
    evento.preventDefault();
    if (evento.dataTransfer) evento.dataTransfer.dropEffect = 'copy';
  }

  onDrop(evento: DragEvent): void {
    evento.preventDefault();
    const nombre = evento.dataTransfer?.getData('text/plain');
    if (!nombre) return;
    const rango = this.obtenerRangoDesdeEvento(evento) ?? this.crearRangoAlFinal();
    this.insertarTokenEnRango(nombre, rango);
  }

  private obtenerRangoDesdeEvento(evento: DragEvent): Range | null {
    const doc = document as any;
    if (doc.caretRangeFromPoint) return doc.caretRangeFromPoint(evento.clientX, evento.clientY);
    if (doc.caretPositionFromPoint) {
      const pos = doc.caretPositionFromPoint(evento.clientX, evento.clientY);
      if (!pos) return null;
      const rango = document.createRange();
      rango.setStart(pos.offsetNode, pos.offset);
      rango.collapse(true);
      return rango;
    }
    return null;
  }

  private crearRangoAlFinal(): Range {
    const host = this.editorRef.nativeElement;
    const rango = document.createRange();
    rango.selectNodeContents(host);
    rango.collapse(false);
    return rango;
  }

  private insertarTokenEnRango(nombre: string, rango: Range): void {
    const token = this.crearToken(nombre);
    rango.deleteContents();
    rango.insertNode(token);

    const espacio = document.createTextNode('\u00A0');
    rango.setStartAfter(token);
    rango.insertNode(espacio);

    const nuevoRango = document.createRange();
    nuevoRango.setStartAfter(espacio);
    nuevoRango.collapse(true);
    const seleccion = window.getSelection();
    seleccion?.removeAllRanges();
    seleccion?.addRange(nuevoRango);
    this.savedRange = nuevoRango;

    this.onInput();
  }

  get placeholderCuerpo(): string {
    const vars = this.variables;
    if (!vars.length) return 'Escribe el mensaje de la plantilla...';
    const ejemplo = vars.map(v => v.nombre).join(', ');
    return `Escribe el mensaje. Puedes usar: ${ejemplo}`;
  }
}