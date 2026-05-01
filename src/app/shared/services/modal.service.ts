import { Injectable, ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Type } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
    private modalRef: ComponentRef<any> | null = null;
    private overlayElement: HTMLDivElement | null = null;

    constructor(
        private appRef: ApplicationRef,
        private injector: EnvironmentInjector
    ) { }

    open(component: Type<any>, inputs?: Record<string, any>, maxWidthClass: string = 'max-w-lg'): ComponentRef<any> {
        this.close(); // cierra si ya hay uno abierto

        // Crear overlay con Tailwind
        this.overlayElement = document.createElement('div');
        this.overlayElement.className =
            'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate__animated animate__fadeIn';
        this.overlayElement.addEventListener('click', (e) => {
            if (e.target === this.overlayElement) this.close();
        });

        // Contenedor del modal (tarjeta)
        const modalContainer = document.createElement('div');
        modalContainer.className =
            `bg-background rounded-lg shadow-xl w-full ${maxWidthClass} mx-4 p-6 animate__animated animate__fadeInUp`;
        this.overlayElement.appendChild(modalContainer);

        // Crear el componente dinámico dentro del contenedor
        const componentRef = createComponent(component, {
            environmentInjector: this.injector,
            hostElement: modalContainer
        });

        if (inputs) {
            Object.keys(inputs).forEach(key => {
                componentRef.setInput(key, inputs[key]);
            });
        }

        // Adjuntar al DOM y detectar cambios
        document.body.appendChild(this.overlayElement);
        this.appRef.attachView(componentRef.hostView);
        this.modalRef = componentRef;

        // Inyectar evento de cierre si el componente emite 'close'
        if (componentRef.instance.closeModal) {
            componentRef.instance.closeModal.subscribe(() => this.close());
        }
        return componentRef;
    }

    close() {
        if (this.modalRef) {
            this.appRef.detachView(this.modalRef.hostView);
            this.modalRef.destroy();
            this.modalRef = null;
        }
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
    }
}