import { ChangeDetectorRef, Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { LoadingService } from '../../services/loading.service';
import { Subject, takeUntil } from 'rxjs';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading implements OnChanges, OnInit, OnDestroy {
  private _fuseLoadingService = inject(LoadingService);
  private _cdRef = inject(ChangeDetectorRef);

  private _unsubscribeAll = new Subject<void>();


  @Input() autoMode: boolean = true;

  mode: 'determinate' | 'indeterminate' = 'indeterminate';
  progress = 0;
  show = false;

  ngOnChanges(changes: SimpleChanges): void {
    if ('autoMode' in changes) {
      // this._fuseLoadingService.setAutoMode(
      //   coerceBooleanProperty(changes['autoMode'].currentValue)
      // );
    }
  }

  ngOnInit(): void {
    this._fuseLoadingService.mode$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(mode => (this.mode = mode));

    this._fuseLoadingService.progress$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(progress => (this.progress = progress));

    this._fuseLoadingService.show$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(show => {
        this.show = show;
        this._cdRef.detectChanges();
        if (show) {
          // Swal.fire({
          //   title: 'Cargando...',
          //   text: 'Por favor espere',
          //   allowOutsideClick: false,
          //   allowEscapeKey: false,
          //   didOpen: () => {
          //     Swal.showLoading();
          //   }
          // });
        } else {
          // Swal.close();
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}