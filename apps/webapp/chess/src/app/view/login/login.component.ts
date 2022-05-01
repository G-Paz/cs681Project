import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { IamService } from "../../service/iam.service";
import { first } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  constructor(
    private iamService: IamService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    if (this.iamService.userValue) {
      this.router.navigate([environment.h]);
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

  onCreateAccount(){
    this.router.navigateByUrl(environment.cra)
  }

  onLogin() {
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.iamService
      .login(
        this.loginForm.controls.username.value,
        this.loginForm.controls.password.value
      )
      .pipe(first())
      .subscribe({
        next: () => {
          // get return url from query parameters or default to home page
          this.router.navigateByUrl(environment.h);
        },
        error: (error) => {
          console.error(error)
        },
      });
  }
}
