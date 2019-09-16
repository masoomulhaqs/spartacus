import { Component, OnInit } from '@angular/core';
import { Order } from '@spartacus/core';
import { Observable } from 'rxjs';
import { OrderDetailsService } from '../order-details.service';

@Component({
  selector: 'cx-order-details-headline',
  templateUrl: './order-detail-headline.component.html',
})
export class OrderDetailHeadlineComponent implements OnInit {
  constructor(private orderDetailsService: OrderDetailsService) {}

  order$: Observable<Order>;

  ngOnInit() {
    this.order$ = this.orderDetailsService.getOrderDetails();
  }

  isOrderCancellable(order: Order): boolean {
    return this.orderDetailsService.isOrderCancellable(order);
  }

  cancel(order: Order) {
    this.orderDetailsService.cancelOrder(order).subscribe(console.log);
  }
}
