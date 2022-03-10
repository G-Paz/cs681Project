import { Component } from '@angular/core';
import { IamService } from './iam.service';
import { Router } from "@angular/router";
import { HttpResponse } from "@angular/common/http";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chess';
  constructor(private sService: IamService, private router: Router) {}

  onClickSubmit(data: any) {
    this.sService.sendSurvey(data, this.processRequest, this.router);
  }

  processRequest(response: HttpResponse<Object>, router: Router) {
    if (response.body != null) {
      if (response.ok) {
        router.navigate(["successful-survey", response.body]);
      } else {
        router.navigate(["error-survey"]);
      }
    }
  }
}
