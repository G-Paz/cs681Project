import { Component, OnInit } from '@angular/core';
import { DelegateService } from 'src/app/service/delegate.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  
  constructor() { }

  ngOnInit(): void {
  }

  getGameHistory(){
    return JSON.parse(sessionStorage.getItem(DelegateService.H_ITEM) + "")
  }

}
