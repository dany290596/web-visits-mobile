import { ApplicationRef, createComponent, EnvironmentInjector, inject } from '@angular/core';
import { Loading } from '../components/loading/loading';

export function provideFuseLoadingBar(
    appRef: ApplicationRef,
    injector: EnvironmentInjector
): () => void {
    return () => {
        const componentRef = createComponent(Loading, {
            environmentInjector: injector
        });

        appRef.attachView(componentRef.hostView);

        const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);
    };
}