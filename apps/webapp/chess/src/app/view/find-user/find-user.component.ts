import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DelegateService } from "src/app/service/delegate.service";
import { IamService } from "src/app/service/iam.service";

@Component({
  selector: "app-find-user",
  templateUrl: "./find-user.component.html",
  styleUrls: ["./find-user.component.css"],
})
export class FindUserComponent implements OnInit {
  searchForm: FormGroup;
  message: string
  constructor(
    private delegateService: DelegateService,
    private iamService: IamService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // set form validations
    this.searchForm = this.formBuilder.group({
      username: ["", Validators.required]
    });
    this.message = ""
  }

  ngOnInit(): void {}

  goToProfile() {
    var findUserControls = this.searchForm.controls;
    var user = this.iamService.userValue;
    this.delegateService.getProfile(
      user.id,
      user.token,
      findUserControls.username.value,
      () => {
        this.router.navigate(["/profile"]);
      },
      () => {this.message = "Unable to find user."}
    );
  }
}
