import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { IamService } from "../iam.service";
// import * as bcrypt from 'bcryptjs';

// var bcrypt = require('bcryptjs');
@Component({
  selector: "app-createaccount",
  templateUrl: "./createaccount.component.html",
  styleUrls: ["./createaccount.component.css"],
})
export class CreateaccountComponent implements OnInit {
  loginForm: FormGroup;
  constructor(
    private iamService: IamService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    if (this.iamService.userValue) {
      this.router.navigate(["/"]);
    }
    // init to be replaced in ngOnInit
    this.loginForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  onSubmit() {
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.iamService
      .createAccount(
        this.loginForm.controls.username.value,
        this.loginForm.controls.password.value
      )
      .pipe(first())
      .subscribe({
        next: () => {
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          console.log("error");
        },
      });
  }
}
